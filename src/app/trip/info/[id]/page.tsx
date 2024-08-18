"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import WeatherCard from "@/components/WeatherCard";
import * as AlertDialog from "@radix-ui/react-alert-dialog";

interface Trip {
  endDate: string;
  startDate: string;
  hotelDetails: string | null;
  flightNumber: string | null;
  id: string;
  name: string;
  city: string;
  state: string;
  country: string;
  durationOfStay: number;
}

interface TripDay {
  id: string;
  tripId: string;
  dayNumber: number;
  whatToDo: string;
  budget?: string | null;
  notes?: string | null;
}

interface WeatherData {
  dt: number;
  main: {
    temp: number;
    humidity: number;
  };
  wind: {
    speed: number;
  };
}

const Info = () => {
  const { data: session } = useSession();
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data: trip, isLoading, error } = api.post.getById.useQuery({ id });
  const { data: tripDays, isLoading: isLoadingDays } =
    api.post.getTripDaysById.useQuery({ tripId: id });

  const { mutate: deleteTrip } = api.post.delete.useMutation({
    onSuccess: () => {
      router.push("/"); // Redirect to another page after deletion
    },
    onError: (error) => {
      console.error("Error deleting trip:", error);
    },
  });

  useEffect(() => {
    if (!session) {
      router.push("/");
    }
  }, [session, router]);

  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [errorWeather, setErrorWeather] = useState<string | null>(null);

  const apiKey = "19f10437487be9120c1af687fe4c9c74";

  useEffect(() => {
    if (trip && trip.length > 0) {
      const city = trip[0]!.city;
      const fetchWeatherData = async () => {
        try {
          const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`,
          );
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          const data = await response.json();
          setWeatherData(data);
          setErrorWeather(null);
        } catch (error) {
          setErrorWeather((error as Error).message);
          setWeatherData(null);
          console.log(errorWeather);
        }
      };

      fetchWeatherData().catch((error) => {
        console.error("Error fetching weather data:", error);
      });
    }
  }, [trip, apiKey, errorWeather]);

  const handleDelete = () => {
    deleteTrip({ id });
  };

  if (isLoading || isLoadingDays) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        Error loading trip: {error.message}
      </div>
    );
  }

  if (!trip || trip.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
        <h2>This trip doesn't exist but you can add one</h2>
        <Button onClick={() => router.push("/trip/add")} className="mt-4">
          Add Trip
        </Button>
      </div>
    );
  }

  return (
    <main className="flex min-h-screen w-full bg-gray-100 text-black">
      <MaxWidthWrapper className="flex flex-col items-center">
        <div className="flex items-center justify-center space-x-4">
          <h2 className="mt-20 text-center">
            Welcome! {session?.user?.name?.toLocaleUpperCase()}
          </h2>
          <Image
            src={session?.user?.image ?? "/default-profile-image.jpg"}
            alt="avatar"
            width={50}
            height={50}
            className="mt-20 h-10 w-10 rounded-full"
          />
        </div>

        <div className="mt-6 w-full">
          {trip.map((trip: Trip) => (
            <div
              key={trip.id}
              className="mb-4 flex flex-col justify-between rounded bg-white p-4 shadow-md md:flex-row"
            >
              <div>
                <h3 className="font-bold">{trip.name}</h3>
                <p>
                  {trip.city}, {trip.state}, {trip.country}
                </p>
                <p>Duration: {trip.durationOfStay} days</p>
                <div className="mt-4 flex gap-x-4">
                  <Button
                    onClick={() => router.push(`/trip/notes/${trip.id}`)}
                    className="mt-2"
                  >
                    Add notes
                  </Button>
                  <Button
                    onClick={() => router.push(`/trip/edit/${trip.id}`)}
                    className="mt-2"
                    variant={"outline"}
                  >
                    Edit Trip
                  </Button>
                  <AlertDialog.Root>
                    <AlertDialog.Trigger asChild>
                      <Button className="mt-2" variant={"destructive"}>
                        Delete Trip
                      </Button>
                    </AlertDialog.Trigger>
                    <AlertDialog.Overlay className="fixed inset-0 bg-black/30" />
                    <AlertDialog.Content className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] rounded-md bg-white p-6 shadow-lg">
                      <AlertDialog.Title className="text-lg font-bold">
                        Are you absolutely sure?
                      </AlertDialog.Title>
                      <AlertDialog.Description className="mt-2">
                        This action cannot be undone. This will permanently
                        delete the trip and remove it from our records.
                      </AlertDialog.Description>
                      <div className="mt-4 flex justify-end gap-x-4">
                        <AlertDialog.Cancel asChild className="rounded-md">
                          <Button variant={"outline"}>Cancel</Button>
                        </AlertDialog.Cancel>
                        <AlertDialog.Action
                          asChild
                          className="rounded-md bg-red-600 p-2 text-white hover:bg-red-700"
                          onClick={handleDelete}
                        >
                          <Button>Delete</Button>
                        </AlertDialog.Action>
                      </div>
                    </AlertDialog.Content>
                  </AlertDialog.Root>
                </div>
              </div>
              <div className="mt-8 md:mt-0">
                <h4>Flight Info</h4>
                <p>Flight Number: {trip.flightNumber ?? "N/A"}</p>
                <h4>Accommodation</h4>
                <p>Hotel Details: {trip.hotelDetails ?? "N/A"}</p>
                <div className="flex justify-start gap-x-2 md:justify-center">
                  <p className="font-bold">From:</p>
                  <p>{trip.startDate}</p>
                  <p className="font-bold">To:</p>
                  <p>{trip.endDate}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {tripDays && tripDays.length > 0 && (
          <div className="mt-8 w-full">
            <h2 className="mb-6 text-center text-xl font-bold">
              Trip Itinerary
            </h2>
            {tripDays.map((day: TripDay) => (
              <div key={day.id} className="mb-4 rounded bg-white p-4 shadow-md">
                <h3 className="font-bold">Day {day.dayNumber}</h3>
                <p>What to do: {day.whatToDo}</p>
                {day.budget && <p>Budget: {day.budget}</p>}
                {day.notes && <p>Notes: {day.notes}</p>}
              </div>
            ))}
          </div>
        )}
        <div className="flex w-full flex-col items-center justify-center pt-8">
          {weatherData && (
            <WeatherCard
              city={trip[0]!.city}
              temperature={weatherData.main.temp}
              humidity={weatherData.main.humidity}
              windSpeed={weatherData.wind.speed}
            />
          )}

          {errorWeather && (
            <div className="mt-4 text-black">
              No weather data found for {trip[0]!.city}
            </div>
          )}
        </div>
      </MaxWidthWrapper>
    </main>
  );
};

export default Info;
