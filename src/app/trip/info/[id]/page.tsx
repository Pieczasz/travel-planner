"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import WeatherCard from "@/components/WeatherCard"; // Import WeatherCard

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
  dt: number; // Unix timestamp
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
  const {
    data: tripDays,
    isLoading: isLoadingDays,
    error: errorDays,
  } = api.post.getTripDaysById.useQuery({ tripId: id });

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
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const data = await response.json();
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          setWeatherData(data);
          setErrorWeather(null);
        } catch (error) {
          setErrorWeather((error as Error).message);
          setWeatherData(null);
        }
      };

      fetchWeatherData().catch((error) => {
        console.error("Error fetching weather data:", error);
      });
    }
  }, [trip, apiKey]);

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
              <div
                className="mb-4 rounded border bg-white p-4 shadow-md"
                key={day.id}
              >
                <h4 className="font-bold">Day {day.dayNumber}</h4>
                <p>
                  <span className="font-bold">What to Do:</span> {day.whatToDo}
                </p>
                {day.budget && (
                  <p>
                    <span className="font-bold">Budget:</span> {day.budget}
                  </p>
                )}
                {day.notes && (
                  <p>
                    <span className="font-bold">Notes:</span> {day.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {weatherData && (
          <div className="mt-8 w-full">
            <h2 className="mb-6 text-center text-xl font-bold">
              Weather Forecast
            </h2>
            <WeatherCard
              city={trip[0]!.city}
              temperature={weatherData.main.temp}
              humidity={weatherData.main.humidity}
              windSpeed={weatherData.wind.speed}
            />
          </div>
        )}
      </MaxWidthWrapper>
    </main>
  );
};

export default Info;
