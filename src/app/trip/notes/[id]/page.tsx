"use client";

// Functions
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

// Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import MaxWidthWrapper from "@/components/MaxWidthWrapper";

// zod
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// TRPC
import { api } from "@/trpc/react";

const tripDaysSchema = z.object({
  tripDays: z.array(
    z.object({
      id: z.string().uuid().optional(),
      dayNumber: z.number().int().min(1).max(14),
      whatToDo: z.string().min(1),
      budget: z.string().nullable(),
      notes: z.string().nullable(),
    }),
  ),
});

interface TripDay {
  id?: string;
  dayNumber: number;
  whatToDo: string;
  budget?: string;
  notes?: string;
}

export default function ManageTripDays() {
  const { id } = useParams<{ id: string }>();

  const { data: session } = useSession();

  const router = useRouter();

  // Redirect to dashboard if user isn't already authenticated
  useEffect(() => {
    if (!session) {
      router.push("/");
    }
  }, [session, router]);

  const {
    data: trip,
    isLoading: isTripLoading,
    error: tripError,
  } = api.post.getById.useQuery({ id });

  const {
    data: days,
    isLoading: isDaysLoading,
    error: daysError,
  } = api.post.getTripDaysById.useQuery({ tripId: id });

  const form = useForm<z.infer<typeof tripDaysSchema>>({
    resolver: zodResolver(tripDaysSchema),
    defaultValues: {
      tripDays: [],
    },
  });

  // Initialize trip days when trip data changes
  useEffect(() => {
    if (trip?.[0]?.durationOfStay) {
      const initialTripDays = Array.from(
        { length: trip[0].durationOfStay },
        (_, index) => ({
          dayNumber: index + 1,
          whatToDo: "",
          budget: "",
          notes: "",
        }),
      );

      form.reset({ tripDays: initialTripDays });
    }
  }, [trip, form]);

  // Update trip days when days data is fetched
  useEffect(() => {
    if (days) {
      const updatedTripDays: TripDay[] = Array.from(
        { length: trip?.[0]?.durationOfStay ?? 0 },
        (_, index) => {
          const day = days.find((day) => day.dayNumber === index + 1);
          return {
            dayNumber: index + 1,
            whatToDo: day?.whatToDo ?? "",
            budget: day?.budget ?? "",
            notes: day?.notes ?? "",
          };
        },
      );

      form.reset({ tripDays: updatedTripDays });
    }
  }, [days, trip, form]);

  const updateTripDays = api.post.updateTripDays.useMutation({
    onSuccess: () => {
      router.push("/dashboard");
    },
    onError: (error) => {
      console.error("Failed to update trip days:", error);
    },
  });

  const onSubmit = (data: z.infer<typeof tripDaysSchema>) => {
    if (trip) {
      updateTripDays.mutate({
        tripId: trip[0]!.id,
        tripDays: data.tripDays.map((day) => ({
          ...day,
          budget: day.budget ?? "",
          notes: day.notes ?? "",
        })),
      });
    }
  };

  if (isTripLoading || isDaysLoading)
    return <div className="min-h-screen bg-gray-100"></div>;
  if (tripError) return <p>Error fetching trip data: {tripError.message}</p>;
  if (daysError) return <p>Error fetching trip days: {daysError.message}</p>;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="my-10 flex w-full flex-col items-start justify-center gap-y-5"
      >
        <MaxWidthWrapper>
          <h1 className="text-center font-extrabold">Manage Trip Days</h1>

          {/* Trip Days */}
          <div>
            <h2 className="text-lg font-semibold">Trip Days</h2>
            {form.watch("tripDays").map((_, index) => (
              <div key={index} className="my-4">
                <FormField
                  control={form.control}
                  name={`tripDays.${index}.dayNumber`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Day {index + 1}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          disabled
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage>
                        {
                          form.formState.errors.tripDays?.[index]?.dayNumber
                            ?.message
                        }
                      </FormMessage>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`tripDays.${index}.whatToDo`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>What to Do</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter what to do"
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage>
                        {
                          form.formState.errors.tripDays?.[index]?.whatToDo
                            ?.message
                        }
                      </FormMessage>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`tripDays.${index}.budget`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Budget</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value ?? ""}
                          placeholder="Enter budget"
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage>
                        {
                          form.formState.errors.tripDays?.[index]?.budget
                            ?.message
                        }
                      </FormMessage>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`tripDays.${index}.notes`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value ?? ""}
                          placeholder="Enter notes"
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage>
                        {
                          form.formState.errors.tripDays?.[index]?.notes
                            ?.message
                        }
                      </FormMessage>
                    </FormItem>
                  )}
                />
              </div>
            ))}
          </div>

          <Button type="submit" className="mt-6">
            Save Changes
          </Button>
        </MaxWidthWrapper>
      </form>
    </Form>
  );
}
