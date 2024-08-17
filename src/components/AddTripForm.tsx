/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
"use client";

// Imports
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { api } from "@/trpc/react";
import { DatePickerWithRange } from "@/components/DatePickerWithRange";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Select from "react-select";
import { Country, State, City } from "country-state-city";
import type { ICity, ICountry, IState } from "country-state-city";
// Zod Schema for Form Validation
const tripFormSchema = z.object({
  name: z.string().min(1, { message: "Name is required." }),
  destination: z.string().min(1, { message: "Destination is required." }),
  hotelDetails: z.string().optional(),
  dateRange: z.object({
    from: z.date({
      required_error: "Start date is required.",
    }),
    to: z
      .date({
        required_error: "End date is required.",
      })
      .refine((val) => val > new Date(), {
        message: "End date must be after start date.",
      }),
  }),
  flightNumber: z.string().optional(),
});

export function CreateTripForm() {
  const [selectedCountry, setSelectedCountry] = useState<ICountry | null>(null);
  const [selectedState, setSelectedState] = useState<IState | null>(null);
  const [selectedCity, setSelectedCity] = useState<ICity | null>(null);

  const router = useRouter();

  const form = useForm<z.infer<typeof tripFormSchema>>({
    resolver: zodResolver(tripFormSchema),
    defaultValues: {
      name: "",
      destination: "",
      hotelDetails: "",
      dateRange: {
        from: new Date(),
        to: new Date(),
      },
      flightNumber: "",
    },
  });

  const createTrip = api.post.create.useMutation({
    onSuccess: () => {
      router.refresh(); // Refresh the page or navigate if necessary
    },
    onError: (error: unknown) => {
      console.error("Error creating trip:", error);
    },
  });

  function onSubmit(data: z.infer<typeof tripFormSchema>) {
    console.log("Form submitted with data:", data); // Debugging statement

    const { dateRange, ...rest } = data;
    const updatedData = {
      ...rest,
      destination: selectedCity?.name ?? "",
      durationOfStay: Math.ceil(
        (dateRange.to.getTime() - dateRange.from.getTime()) /
          (1000 * 60 * 60 * 24),
      ),
    };
    console.log("Updated data:", updatedData); // Debugging statement
    createTrip.mutate(updatedData);
  }

  const handleCountryChange = (country: ICountry | null) => {
    setSelectedCountry(country);
    setSelectedState(null); // Reset state and city
    setSelectedCity(null);
  };

  const handleStateChange = (state: IState | null) => {
    setSelectedState(state);
    setSelectedCity(null); // Reset city
  };

  const countries = Country.getAllCountries();
  const states = selectedCountry
    ? State.getStatesOfCountry(selectedCountry.isoCode)
    : [];
  const cities = selectedState
    ? City.getCitiesOfState(selectedState.countryCode, selectedState.isoCode)
    : [];

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="my-10 flex w-full flex-col items-start justify-center gap-y-5 px-10"
      >
        <h1 className="mb-5 text-center text-2xl font-bold">Create a Trip</h1>

        {/* Name Field */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Enter trip name"
                  className="w-full"
                />
              </FormControl>
              <FormMessage>{form.formState.errors.name?.message}</FormMessage>
            </FormItem>
          )}
        />

        {/* Country Selector */}
        <FormItem>
          <FormLabel>Country</FormLabel>
          <FormControl>
            <Select
              options={countries}
              getOptionLabel={(option) => option.name}
              getOptionValue={(option) => option.isoCode}
              value={selectedCountry}
              onChange={handleCountryChange}
              placeholder="Select a country"
            />
          </FormControl>
        </FormItem>

        {/* State Selector */}
        <FormItem>
          <FormLabel>State</FormLabel>
          <FormControl>
            <Select
              options={states}
              getOptionLabel={(option) => option.name}
              getOptionValue={(option) => option.isoCode}
              value={selectedState}
              onChange={handleStateChange}
              placeholder="Select a state"
              isDisabled={!selectedCountry}
            />
          </FormControl>
        </FormItem>

        {/* City Selector */}
        <FormItem>
          <FormLabel>City</FormLabel>
          <FormControl>
            <Select
              options={cities}
              getOptionLabel={(option) => option.name}
              getOptionValue={(option) => option.name}
              value={selectedCity}
              onChange={(city) => setSelectedCity(city)}
              placeholder="Select a city"
              isDisabled={!selectedState}
            />
          </FormControl>
        </FormItem>

        {/* Date Range Field */}
        <FormField
          control={form.control}
          name="dateRange"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date Range</FormLabel>
              <DatePickerWithRange
                className="w-[300px]"
                onChange={(dateRange) => field.onChange(dateRange)}
                value={field.value}
              />
              <FormDescription>
                Choose the date range for your trip.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Hotel Details Field */}
        <FormField
          control={form.control}
          name="hotelDetails"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hotel Details</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Enter hotel details"
                  className="w-full"
                />
              </FormControl>
              <FormMessage>
                {form.formState.errors.hotelDetails?.message}
              </FormMessage>
            </FormItem>
          )}
        />

        {/* Flight Number Field */}
        <FormField
          control={form.control}
          name="flightNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Flight Number</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Enter flight number"
                  className="w-full"
                />
              </FormControl>
              <FormMessage>
                {form.formState.errors.flightNumber?.message}
              </FormMessage>
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <Button type="submit" className="mt-4">
          Create Trip
        </Button>
      </form>
    </Form>
  );
}

export default CreateTripForm;
