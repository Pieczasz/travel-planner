"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm, Controller } from "react-hook-form";

// Define types for Trip and Day
interface Day {
  id: string;
  dayNumber: number;
  whatToDo: string;
  budget: string;
  notes: string;
}

interface Trip {
  id: string;
  userId: string;
  name: string;
  country: string;
  state: string;
  city: string;
  hotelDetails: string | null;
  durationOfStay: number;
  flightNumber: string | null;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  days: Day[];
}

export default function EditTrip() {
  // Check if params.slug is an array before joining
  const { id } = useParams<{ id: string }>();

  const router = useRouter();

  const {
    data: trip,
    isLoading,
    error,
  } = api.post.getById.useQuery({
    id,
  });

  const { control, handleSubmit, setValue, getValues } = useForm<Trip>({
    defaultValues: {
      name: "",
      country: "",
      state: "",
      city: "",
      hotelDetails: "",
      durationOfStay: 0,
      flightNumber: "",
      startDate: "",
      endDate: "",
      days: [],
    },
  });

  useEffect(() => {
    if (trip) {
      // Set form values with fetched trip data
      Object.keys(trip).forEach((key) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        setValue(key as keyof Trip, trip[key as keyof Trip]);
      });
    }
  }, [trip, setValue]);

  const handleSave = async (formData: Trip) => {
    try {
      await api.post.update.mutate({
        id: formData.id,
        name: formData.name,
        country: formData.country,
        state: formData.state,
        city: formData.city,
        hotelDetails: formData.hotelDetails,
        durationOfStay: formData.durationOfStay,
        flightNumber: formData.flightNumber,
        startDate: formData.startDate,
        endDate: formData.endDate,
        days: formData.days.map((day) => ({
          id: day.id,
          dayNumber: day.dayNumber,
          whatToDo: day.whatToDo,
          budget: day.budget,
          notes: day.notes,
        })),
      });
      router.push("/dashboard");
    } catch (error) {
      console.error("Error saving trip:", error);
    }
  };

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error loading trip: {error.message}</p>;

  return (
    <div className="p-4">
      <h1>Edit Trip</h1>
      <form onSubmit={handleSubmit(handleSave)}>
        <div>
          <label>Trip Name</label>
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <Input {...field} placeholder="Enter trip name" />
            )}
          />
        </div>
        <div>
          <label>Country</label>
          <Controller
            name="country"
            control={control}
            render={({ field }) => (
              <Input {...field} placeholder="Enter country" />
            )}
          />
        </div>
        <div>
          <label>State</label>
          <Controller
            name="state"
            control={control}
            render={({ field }) => (
              <Input {...field} placeholder="Enter state" />
            )}
          />
        </div>
        <div>
          <label>City</label>
          <Controller
            name="city"
            control={control}
            render={({ field }) => (
              <Input {...field} placeholder="Enter city" />
            )}
          />
        </div>
        <div>
          <label>Hotel Details</label>
          <Controller
            name="hotelDetails"
            control={control}
            render={({ field }) => (
              <Input {...field} placeholder="Enter hotel details" />
            )}
          />
        </div>
        <div>
          <label>Duration of Stay (days)</label>
          <Controller
            name="durationOfStay"
            control={control}
            render={({ field }) => <Input type="number" {...field} />}
          />
        </div>
        <div>
          <label>Flight Number</label>
          <Controller
            name="flightNumber"
            control={control}
            render={({ field }) => (
              <Input {...field} placeholder="Enter flight number" type="text" />
            )}
          />
        </div>
        <div>
          <label>Start Date</label>
          <Controller
            name="startDate"
            control={control}
            render={({ field }) => <Input type="date" {...field} />}
          />
        </div>
        <div>
          <label>End Date</label>
          <Controller
            name="endDate"
            control={control}
            render={({ field }) => <Input type="date" {...field} />}
          />
        </div>
        <div>
          <h2>Daily Plans</h2>
          {getValues("days").map((day: Day, index: number) => (
            <div key={day.id} className="mb-4">
              <h3>Day {index + 1}</h3>
              <div>
                <label>What to Do</label>
                <Controller
                  name={`days.${index}.whatToDo`}
                  control={control}
                  render={({ field }) => (
                    <Input {...field} placeholder="What to do" />
                  )}
                />
              </div>
              <div>
                <label>Budget</label>
                <Controller
                  name={`days.${index}.budget`}
                  control={control}
                  render={({ field }) => (
                    <Input {...field} placeholder="Budget" />
                  )}
                />
              </div>
              <div>
                <label>Notes</label>
                <Controller
                  name={`days.${index}.notes`}
                  control={control}
                  render={({ field }) => (
                    <textarea {...field} placeholder="Notes" />
                  )}
                />
              </div>
            </div>
          ))}
        </div>
        <Button type="submit">Save Changes</Button>
      </form>
    </div>
  );
}
