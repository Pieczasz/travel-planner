import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { trips } from "@/server/db/schema"; // Adjust the import path as needed
import { and, eq } from "drizzle-orm";

export const postRouter = createTRPCRouter({
  // Public endpoint for testing or other non-authenticated use cases
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  // Create a new trip
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        country: z.string().min(1),
        state: z.string().min(1),
        city: z.string().min(1),
        hotelDetails: z.string().optional(),
        durationOfStay: z.number().int().min(1).max(14),
        flightNumber: z.string().optional(),
        startDate: z.string().min(1), // Add this line
        endDate: z.string().min(1), // Add this line
        createdAt: z.string().optional(),
        updatedAt: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const today = new Date().toUTCString();

      await ctx.db.insert(trips).values({
        userId: ctx.session.user.id,
        name: input.name,
        country: input.country,
        state: input.state,
        city: input.city,
        hotelDetails: input.hotelDetails,
        durationOfStay: input.durationOfStay,
        flightNumber: input.flightNumber,
        startDate: input.startDate, // Update this line
        endDate: input.endDate, // Update this line
        createdAt: input.createdAt ?? today,
        updatedAt: input.updatedAt ?? today,
      });
    }),

  // Fetch all trips for the logged-in user
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const userTrips = await ctx.db
      .select()
      .from(trips)
      .where(eq(trips.userId, userId));

    return userTrips;
  }),

  // Fetch a specific trip by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const trip = await ctx.db
        .select()
        .from(trips)
        .where(and(eq(trips.id, input.id), eq(trips.userId, userId)));

      if (!trip) {
        throw new Error(
          "Trip not found or you do not have access to this trip",
        );
      }

      return trip;
    }),

  // Update a trip by ID
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().optional(),
        country: z.string().optional(),
        state: z.string().optional(),
        city: z.string().optional(),
        hotelDetails: z.string().optional(),
        durationOfStay: z.number().int().min(1).max(14).optional(),
        flightNumber: z.string().optional(),
        startDate: z.string().optional(), // Add this line
        endDate: z.string().optional(), // Add this line
        updatedAt: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const result = await ctx.db
        .update(trips)
        .set({
          name: input.name,
          country: input.country,
          state: input.state,
          city: input.city,
          hotelDetails: input.hotelDetails,
          durationOfStay: input.durationOfStay,
          flightNumber: input.flightNumber,
          startDate: input.startDate ?? new Date().toISOString(), // Update this line
          endDate: input.endDate ?? new Date().toISOString(), // Update this line
          updatedAt: input.updatedAt ?? new Date().toUTCString(),
        })
        .where(and(eq(trips.id, input.id), eq(trips.userId, userId)));

      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
      if ((result as any).changes === 0) {
        throw new Error(
          "Trip not found or you do not have access to this trip",
        );
      }
    }),

  // Delete a trip by ID
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const result = await ctx.db
        .delete(trips)
        .where(and(eq(trips.id, input.id), eq(trips.userId, userId)));

      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
      if ((result as any).changes === 0) {
        throw new Error(
          "Trip not found or you do not have access to this trip",
        );
      }
    }),

  // Example of a protected endpoint returning a secret message
  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),
});
