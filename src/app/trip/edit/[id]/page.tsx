"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { DatePickerWithRange } from "@/components/ui/DatePickerWithRange";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Country, State, City } from "country-state-city";
import type { ICity, ICountry, IState } from "country-state-city";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";

interface Trip {
  name: string;
  country: string;
  state: string;
  city: string;
  hotelDetails: string | null;
  flightNumber: string | null;
  durationOfStay: number;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  id: string;
  userId: string;
}

// Zod Schema for Form Validation
const tripFormSchema = z.object({
  name: z.string().min(1, { message: "Name is required." }),
  country: z.string().min(1, { message: "Country is required." }),
  state: z.string().min(1, { message: "State is required." }),
  city: z.string().min(1, { message: "City is required." }),
  hotelDetails: z.string().optional(),
  dateRange: z.object({
    from: z
      .date({
        required_error: "Start date is required.",
      })
      .nullable(),
    to: z
      .date({
        required_error: "End date is required.",
      })
      .nullable()
      .refine((val) => val! > new Date(), {
        message: "End date must be after start date.",
      }),
  }),
  flightNumber: z.string().optional(),
});

export default function EditTrip() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data: trip, isLoading, error } = api.post.getById.useQuery({ id });

  const form = useForm<z.infer<typeof tripFormSchema>>({
    resolver: zodResolver(tripFormSchema),
    defaultValues: {
      name: "",
      country: "",
      state: "",
      city: "",
      hotelDetails: "",
      dateRange: {
        from: null,
        to: null,
      },
      flightNumber: "",
    },
  });

  const [selectedCountry, setSelectedCountry] = useState<ICountry | null>(null);
  const [selectedState, setSelectedState] = useState<IState | null>(null);
  const [selectedCity, setSelectedCity] = useState<ICity | null>(null);

  useEffect(() => {
    if (trip && trip.length > 0) {
      const tripDetails = trip[0]; // Access the first object in the array

      if (!tripDetails) {
        return;
      }

      const { name, country, state, city, hotelDetails, flightNumber } =
        tripDetails; // Extract details from tripDetails

      // Set form values
      form.setValue("name", name);
      form.setValue("country", country);
      form.setValue("state", state);
      form.setValue("city", city);
      form.setValue("hotelDetails", hotelDetails ?? "");

      form.setValue("flightNumber", flightNumber ?? "");

      // Set selected country, state, and city
      const countryData = Country.getAllCountries().find(
        (c) => c.isoCode === country,
      );
      const stateData = countryData
        ? State.getStatesOfCountry(countryData.isoCode).find(
            (s) => s.isoCode === state,
          )
        : null;
      const cityData = stateData
        ? City.getCitiesOfState(stateData.countryCode, stateData.isoCode).find(
            (c) => c.name === city,
          )
        : null;

      setSelectedCountry(countryData ?? null);
      setSelectedState(stateData ?? null);
      setSelectedCity(cityData ?? null);
    }
  }, [trip, form]);

  const handleCountryChange = (value: string) => {
    const country = Country.getAllCountries().find((c) => c.isoCode === value);
    setSelectedCountry(country ?? null);
    setSelectedState(null); // Reset state and city
    setSelectedCity(null);
    form.setValue("country", value);
  };

  const handleStateChange = (value: string) => {
    const state = selectedCountry
      ? State.getStatesOfCountry(selectedCountry.isoCode).find(
          (s) => s.isoCode === value,
        )
      : null;
    setSelectedState(state ?? null);
    setSelectedCity(null); // Reset city
    form.setValue("state", value);
  };

  const handleCityChange = (value: string) => {
    const city = selectedState
      ? City.getCitiesOfState(
          selectedState.countryCode,
          selectedState.isoCode,
        ).find((c) => c.name === value)
      : null;
    setSelectedCity(city ?? null);
    form.setValue("city", value);
  };

  const deleteTripDays = api.post.deleteTripDays.useMutation({
    onSuccess: () => {
      router.push("/dashboard"); // Navigate back to trips list
    },
    onError: (error) => {
      console.error("Failed to delete trip days:", error);
    },
  });

  const updateTrip = api.post.update.useMutation({
    onSuccess: () => {
      if (trip) {
        deleteTripDays.mutate({ tripId: trip[0]!.id });
      } else router.push("/dashboard"); // Navigate back to trips list
    },
    onError: (error) => {
      console.error("Failed to update trip:", error);
      // You can display an error message or handle it accordingly
    },
  });

  const onSubmit = (data: z.infer<typeof tripFormSchema>) => {
    const { dateRange, ...rest } = data;

    const updatedData = {
      ...rest,
      startDate: dateRange.from ? format(dateRange.from, "dd-MM-yyyy") : "",
      endDate: dateRange.to ? format(dateRange.to, "dd-MM-yyyy") : "",
      durationOfStay:
        dateRange.from && dateRange.to
          ? Math.ceil(
              (dateRange.to.getTime() - dateRange.from.getTime()) /
                (1000 * 60 * 60 * 24),
            )
          : 0,
    };

    if (trip) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      updateTrip.mutate({ ...updatedData, id: trip[0]!.id });
    }
  };

  if (isLoading) return <div className="min-h-screen bg-gray-100"></div>;
  if (error) return <p>Error loading trip</p>;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="my-10 flex w-full flex-col items-start justify-center gap-y-5"
      >
        <MaxWidthWrapper>
          <h1 className="text-center font-extrabold">Edit Trip</h1>
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
                      {Country.getAllCountries().map((country) => (
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
                      {selectedCountry &&
                        State.getStatesOfCountry(selectedCountry.isoCode).map(
                          (state) => (
                            <SelectItem
                              key={state.isoCode}
                              value={state.isoCode}
                            >
                              {state.name}
                            </SelectItem>
                          ),
                        )}
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
                      {selectedState &&
                        City.getCitiesOfState(
                          selectedState.countryCode,
                          selectedState.isoCode,
                        ).map((city) => (
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

          {/* Date Range Picker */}
          <FormField
            control={form.control}
            name="dateRange"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dates</FormLabel>
                <FormControl>
                  <DatePickerWithRange
                    {...field}
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                    value={field.value as DateRange}
                    onChange={(range) => {
                      if (range) {
                        form.setValue("dateRange", {
                          from: range.from ?? null,
                          to: range.to ?? null,
                        });
                      } else {
                        form.setValue("dateRange", { from: null, to: null });
                      }
                    }}
                  />
                </FormControl>
                <FormMessage>
                  {form.formState.errors.dateRange?.from?.message}
                  {form.formState.errors.dateRange?.to?.message}
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

          <Button type="submit" className="mt-6">
            Save Trip
          </Button>
        </MaxWidthWrapper>
      </form>
    </Form>
  );
}
