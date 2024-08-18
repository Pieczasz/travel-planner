/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

// Existing schema for Users, Accounts, Sessions, and VerificationTokens
import type {
  DefaultSQLiteUsersTable,
  DefaultSQLiteAccountsTable,
  DefaultSQLiteSessionsTable,
  DefaultSQLiteVerificationTokenTable,
} from "node_modules/@auth/drizzle-adapter/lib/sqlite";

// Users table
export const users = sqliteTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").notNull(),
  password: text("password"),
  emailVerified: integer("emailVerified", { mode: "timestamp_ms" }),
  image: text("image"),
}) as unknown as DefaultSQLiteUsersTable;

// Accounts table
export const accounts = sqliteTable("account", {
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("providerAccountId").notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: integer("expires_at"),
  token_type: text("token_type"),
  scope: text("scope"),
  id_token: text("id_token"),
  session_state: text("session_state"),
}) as unknown as DefaultSQLiteAccountsTable;

// Sessions table
export const sessions = sqliteTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
}) as unknown as DefaultSQLiteSessionsTable;

// Verification Tokens table
export const verificationTokens = sqliteTable("verificationToken", {
  identifier: text("identifier").notNull(),
  token: text("token").notNull(),
  expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
}) as unknown as DefaultSQLiteVerificationTokenTable;

// Define relationships between Accounts and Users
export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

// Define relationships between Users and Accounts
export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
}));

// Posts table (existing, though unrelated to the trip planner)
export const posts = sqliteTable("posts", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  content: text("content").notNull(),
  createdAt: text("createdAt").notNull(),
  updatedAt: text("updatedAt").notNull(),
  type: text("type").notNull(),
});

// Additions for the Trip Planner

// Trips table
export const trips = sqliteTable("trips", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }), // Foreign key to Users
  name: text("name").notNull(), // Trip Name
  country: text("country").notNull(), // Country
  state: text("state").notNull(), // State
  city: text("city").notNull(), // City
  hotelDetails: text("hotelDetails"),
  durationOfStay: integer("durationOfStay").notNull(), // Duration in days (1-14)
  flightNumber: text("flightNumber"),
  startDate: text("startDate").notNull(), // Start date in dd.mm.yyyy format
  endDate: text("endDate").notNull(), // End date in dd.mm.yyyy format
  createdAt: text("createdAt").notNull(),
  updatedAt: text("updatedAt").notNull(),
});

// Trip Days table
export const tripDays = sqliteTable("tripDays", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  tripId: text("tripId")
    .notNull()
    .references(() => trips.id, { onDelete: "cascade" }), // Foreign key to Trips
  dayNumber: integer("dayNumber").notNull(), // Day number (1-14)
  whatToDo: text("whatToDo").notNull(), // Plan for the day
  budget: text("budget"),
  notes: text("notes"),
});

// Define relationships between Trips and Users
export const tripsRelations = relations(trips, ({ one, many }) => ({
  user: one(users, { fields: [trips.userId], references: [users.id] }),
  days: many(tripDays), // A trip has many days
}));

// Define relationships between TripDays and Trips
export const tripDaysRelations = relations(tripDays, ({ one }) => ({
  trip: one(trips, { fields: [tripDays.tripId], references: [trips.id] }),
}));

// Type exports (optional but helpful)
export type InsertAccounts = typeof accounts.$inferInsert;
export type SelectAccounts = typeof accounts.$inferSelect;
export type InsertTrips = typeof trips.$inferInsert;
export type SelectTrips = typeof trips.$inferSelect;
export type InsertTripDays = typeof tripDays.$inferInsert;
export type SelectTripDays = typeof tripDays.$inferSelect;
