"use client";
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

// Functions
import React, { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

// Components
import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import Image from "next/image";
import { Button } from "@/components/ui/button";

// TRPC
import { api } from "@/trpc/react";

// Icons
import { FiLogOut } from "react-icons/fi";

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

const Dashboard = () => {
  
  const { data: session } = useSession();
  const router = useRouter();

  const { data: trips, isLoading, error } = api.post.getAll.useQuery();

  // Redirect to dashboard if user isn't already authenticated
  useEffect(() => {
    if (!session) {
      router.push("/");
    }
  }, [session, router]);

  if (isLoading) {
    return <div className="min-h-screen bg-gray-100"></div>;
  }

  if (error) {
    return <div>Error loading trips: {error.message}</div>;
  }

  return (
    <main className="flex min-h-screen w-full bg-gray-100 text-black">
      <MaxWidthWrapper className="flex flex-col items-center">
        <div className="mt-20 flex w-full items-start justify-between">
          <div className="flex flex-col items-start">
            <div className="flex items-center gap-x-2">
              <h2 className="text-left">
                Welcome! {session?.user?.name?.toLocaleUpperCase()}
              </h2>
              <Image
                src={session?.user?.image ?? "/default-profile-image.jpg"}
                alt="avatar"
                width={50}
                height={50}
                className="h-10 w-10 rounded-full"
              />
            </div>
            <div className="mt-4">
              {trips && trips.length === 0 ? (
                <div className="flex items-center space-x-4">
                  <h2>Don't have any trips yet? Let's add one</h2>
                  <Button onClick={() => router.push("/trip/add")}>
                    Add Trip
                  </Button>
                </div>
              ) : (
                <h2>Your Trips:</h2>
              )}
            </div>
          </div>
          <div
            onClick={() => router.push("/api/auth/signout")}
            className="flex cursor-pointer items-center"
          >
            <FiLogOut className="h-8 w-8 text-right hover:text-gray-700" />
          </div>
        </div>

        {trips && trips.length > 0 && (
          <div className="mt-4 w-full">
            {trips.map((trip: Trip) => (
              <div
                key={trip.id}
                className="mb-4 flex flex-col justify-between rounded bg-white p-4 shadow-md hover:scale-[1.02] hover:cursor-pointer md:flex-row"
                onClick={() => router.push(`/trip/info/${trip.id}`)}
              >
                <div className="flex flex-col justify-center">
                  <h3 className="font-bold">{trip.name}</h3>
                  <p>
                    {trip.city}, {trip.state}, {trip.country}
                  </p>
                  <p>Duration: {trip.durationOfStay} days</p>
                </div>
                <div className="mt-8 justify-center md:mt-0">
                  <h4 className="font-bold">Flight Info</h4>
                  <p>Flight Number: {trip.flightNumber}</p>
                  <h4 className="font-bold">Accommodation</h4>
                  <p>Hotel Details: {trip.hotelDetails}</p>
                  <div className="flex justify-start gap-x-2 md:justify-center">
                    <p className="font-bold">From:</p>
                    <p>{trip.startDate}</p>
                    <p className="font-bold">To:</p>
                    <p>{trip.endDate}</p>
                  </div>
                </div>
              </div>
            ))}
            <div className="mt-4 flex justify-center">
              <Button onClick={() => router.push("/trip/add")} size="lg">
                Add Trip
              </Button>
            </div>
          </div>
        )}
      </MaxWidthWrapper>
    </main>
  );
};

export default Dashboard;
