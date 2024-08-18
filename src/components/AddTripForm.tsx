"use client";

// Functions
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

// Components
import { DatePickerWithRange } from "@/components/ui/DatePickerWithRange";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Country, State, City } from "country-state-city";
import type { ICountry, IState } from "country-state-city";

// ZOD
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// TRPC
import { api } from "@/trpc/react";

// Date formater
import { format } from "date-fns";
import MaxWidthWrapper from "./MaxWidthWrapper";

// Zod Schema for Form Validation
const tripFormSchema = z.object({
  name: z.string().min(1, { message: "Name is required." }),
  country: z.string().min(1, { message: "Country is required." }),
  state: z.string().min(1, { message: "State is required." }),
  city: z.string().min(1, { message: "City is required." }),
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

export default function AddTripForm() {
  const [selectedCountry, setSelectedCountry] = useState<ICountry | null>(null);
  const [selectedState, setSelectedState] = useState<IState | null>(null);

  const router = useRouter();

  const form = useForm<z.infer<typeof tripFormSchema>>({
    resolver: zodResolver(tripFormSchema),
    defaultValues: {
      name: "",
      country: "",
      state: "",
      city: "",
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
      router.push("/dashboard");
    },
    onError: (error: unknown) => {
      console.error("Error creating trip:", error);
    },
  });

  function onSubmit(data: z.infer<typeof tripFormSchema>) {
    const { dateRange, ...rest } = data;
    const updatedData = {
      ...rest,
      // Convert dateRange to dd-MM-yyyy format
      startDate: format(dateRange.from, "dd-MM-yyyy"),
      endDate: format(dateRange.to, "dd-MM-yyyy"),
      durationOfStay: Math.ceil(
        (dateRange.to.getTime() - dateRange.from.getTime()) /
          (1000 * 60 * 60 * 24),
      ),
    };
    createTrip.mutate(updatedData);
  }

  const handleCountryChange = (value: string) => {
    const country = Country.getAllCountries().find((c) => c.isoCode === value);
    setSelectedCountry(country ?? null);
    setSelectedState(null); // Reset state and city

    form.setValue("country", value); // Update form state
  };

  const handleStateChange = (value: string) => {
    const state = State.getStatesOfCountry(selectedCountry?.isoCode ?? "").find(
      (s) => s.isoCode === value,
    );
    setSelectedState(state ?? null);

    form.setValue("state", value); // Update form state
  };

  const handleCityChange = (value: string) => {
    form.setValue("city", value); // Update form state
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
        className="my-10 flex w-full flex-col items-start justify-center gap-y-5"
      >
        <MaxWidthWrapper>
          <h1 className="text-center font-extrabold">Create Trip</h1>

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
          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country</FormLabel>
                <FormControl>
                  <Select
                    value={field.value}
                    onValueChange={handleCountryChange}
                  >
                    <SelectTrigger className="w-[280px]">
                      <SelectValue placeholder="Select a country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem
                          key={country.isoCode}
                          value={country.isoCode}
                        >
                          {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage>
                  {form.formState.errors.country?.message}
                </FormMessage>
              </FormItem>
            )}
          />

          {/* State Selector */}
          <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormLabel>State</FormLabel>
                <FormControl>
                  <Select
                    value={field.value}
                    onValueChange={handleStateChange}
                    disabled={!selectedCountry}
                  >
                    <SelectTrigger className="w-[280px]">
                      <SelectValue placeholder="Select a state" />
                    </SelectTrigger>
                    <SelectContent>
                      {states.map((state) => (
                        <SelectItem key={state.isoCode} value={state.isoCode}>
                          {state.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage>
                  {form.formState.errors.state?.message}
                </FormMessage>
              </FormItem>
            )}
          />

          {/* City Selector */}
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Select
                    value={field.value}
                    onValueChange={handleCityChange}
                    disabled={!selectedState}
                  >
                    <SelectTrigger className="w-[280px]">
                      <SelectValue placeholder="Select a city" />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map((city) => (
                        <SelectItem key={city.name} value={city.name}>
                          {city.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage>{form.formState.errors.city?.message}</FormMessage>
              </FormItem>
            )}
          />

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
          <Button type="submit" className="mt-6">
            Create a Trip
          </Button>
        </MaxWidthWrapper>
      </form>
    </Form>
  );
}
