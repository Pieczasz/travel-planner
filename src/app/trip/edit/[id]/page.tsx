/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
"use client";

import React, { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";

// Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { DatePickerWithRange } from "@/components/ui/DatePickerWithRange";

// TRPC
import { api } from "@/trpc/react";

// Country-State-City data
import { Country, State, City } from "country-state-city";
import type { ICity, ICountry, IState } from "country-state-city";

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

export default function EditTrip() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data: trip, isLoading, error } = api.post.getById.useQuery({ id });
  const { control, handleSubmit, setValue, getValues } = useForm<
    z.infer<typeof tripFormSchema>
  >({
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

  useEffect(() => {
    if (trip && trip.length > 0) {
      const firstTrip = trip[0];
      setValue("name", firstTrip!.name);
      setValue("country", firstTrip!.country);
      setValue("state", firstTrip!.state);
      setValue("city", firstTrip!.city);
      setValue("hotelDetails", firstTrip!.hotelDetails ?? "");
      setValue("dateRange", {
        from: new Date(firstTrip!.startDate),
        to: new Date(firstTrip!.endDate),
      });
      setValue("flightNumber", firstTrip!.flightNumber ?? "");
    }
  }, [trip, setValue]);

  const handleSave = async (formData: z.infer<typeof tripFormSchema>) => {
    try {
      const updatedData = {
        ...formData,
        startDate: format(formData.dateRange.from, "yyyy-MM-dd"),
        endDate: format(formData.dateRange.to, "yyyy-MM-dd"),
        durationOfStay: Math.ceil(
          (formData.dateRange.to.getTime() -
            formData.dateRange.from.getTime()) /
            (1000 * 60 * 60 * 24),
        ),
      };

      await api.post.update.mutate({ id, ...updatedData });
      router.push("/dashboard");
    } catch (error) {
      console.error("Error saving trip:", error);
    }
  };

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error loading trip: {error.message}</p>;

  const countries = Country.getAllCountries();
  const states = getValues("country")
    ? State.getStatesOfCountry(getValues("country"))
    : [];
  const cities = getValues("state")
    ? City.getCitiesOfState(getValues("state"), getValues("country"))
    : [];

  return (
    <Form {...control}>
      <form
        onSubmit={handleSubmit(handleSave)}
        className="my-10 flex w-full flex-col items-start justify-center gap-y-5"
      >
        <h1 className="mb-5 text-center text-2xl font-bold">Edit Trip</h1>

        {/* Name Field */}
        <FormField
          control={control}
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
              <FormMessage>
                {control._formState.errors.name?.message}
              </FormMessage>
            </FormItem>
          )}
        />

        {/* Country Selector */}
        <FormField
          control={control}
          name="country"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Country</FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  setValue("state", ""); // Reset state and city when country changes
                  setValue("city", "");
                }}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country.isoCode} value={country.isoCode}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </FormControl>
              </Select>
              <FormMessage>
                {control._formState.errors.country?.message}
              </FormMessage>
            </FormItem>
          )}
        />

        {/* State Selector */}
        <FormField
          control={control}
          name="state"
          render={({ field }) => (
            <FormItem>
              <FormLabel>State</FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  setValue("city", ""); // Reset city when state changes
                }}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {states.map((state) => (
                      <SelectItem key={state.isoCode} value={state.isoCode}>
                        {state.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </FormControl>
              </Select>
              <FormMessage>
                {control._formState.errors.state?.message}
              </FormMessage>
            </FormItem>
          )}
        />

        {/* City Selector */}
        <FormField
          control={control}
          name="city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>City</FormLabel>
              <Select {...field} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((city) => (
                      <SelectItem key={city.name} value={city.name}>
                        {city.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </FormControl>
              </Select>
              <FormMessage>
                {control._formState.errors.city?.message}
              </FormMessage>
            </FormItem>
          )}
        />

        {/* Hotel Details */}
        <FormField
          control={control}
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
                {control._formState.errors.hotelDetails?.message}
              </FormMessage>
            </FormItem>
          )}
        />

        {/* Date Range */}
        <FormField
          control={control}
          name="dateRange"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date Range</FormLabel>
              <Controller
                name="dateRange"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <DatePickerWithRange
                    onChange={(dates) => {
                      onChange(dates);
                    }}
                    value={value}
                  />
                )}
              />
              <FormMessage>
                {control._formState.errors.dateRange?.message}
              </FormMessage>
            </FormItem>
          )}
        />

        {/* Flight Number */}
        <FormField
          control={control}
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
                {control._formState.errors.flightNumber?.message}
              </FormMessage>
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <Button type="submit">Save Changes</Button>
      </form>
    </Form>
  );
}
