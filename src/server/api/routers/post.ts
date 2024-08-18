import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

import { tripDays, trips } from "@/server/db/schema";

import { and, eq } from "drizzle-orm";

export const postRouter = createTRPCRouter({
  // Adding days to a trip
  addDay: protectedProcedure
    .input(
      z.object({
        tripId: z.string().uuid(),
        dayNumber: z.number().int().min(1),
        whatToDo: z.string().min(1),
        budget: z.string().optional(),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(tripDays).values({
        tripId: input.tripId,
        dayNumber: input.dayNumber,
        whatToDo: input.whatToDo,
        budget: input.budget ?? "",
        notes: input.notes ?? "",
      });
    }),

  // Updating trip days
  updateTripDays: protectedProcedure
    .input(
      z.object({
        tripId: z.string().uuid(),
        tripDays: z.array(
          z.object({
            id: z.string().uuid().optional(), // Optional, for update purposes
            dayNumber: z.number().int().min(1),
            whatToDo: z.string().min(1),
            budget: z.string().optional(),
            notes: z.string().optional(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { tripId, tripDays: newTripDays } = input;

      // Delete existing days for the trip after editing
      await ctx.db.delete(tripDays).where(eq(tripDays.tripId, tripId));

      // Insert new days
      await ctx.db.insert(tripDays).values(
        newTripDays.map((day) => ({
          tripId,
          dayNumber: day.dayNumber,
          whatToDo: day.whatToDo,
          budget: day.budget ?? "",
          notes: day.notes ?? "",
        })),
      );
    }),

  // Get trip days by trip ID
  getTripDaysById: protectedProcedure
    .input(z.object({ tripId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const days = await ctx.db
        .select()
        .from(tripDays)
        .where(eq(tripDays.tripId, input.tripId));
      return days;
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
        startDate: z.string().min(1),
        endDate: z.string().min(1),
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
        startDate: input.startDate,
        endDate: input.endDate,
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
        startDate: z.string().optional(),
        endDate: z.string().optional(),
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
          startDate: input.startDate ?? new Date().toISOString(),
          endDate: input.endDate ?? new Date().toISOString(),
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

  deleteTripDays: protectedProcedure
    .input(z.object({ tripId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { tripId } = input;

      // Delete all trip days for the given tripId
      const result = await ctx.db
        .delete(tripDays)
        .where(eq(tripDays.tripId, tripId));

      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
      if ((result as any).changes === 0) {
        throw new Error("No trip days found for the provided trip ID");
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
});
