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

console.log(api);
const Dashboard = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const { data: trips, isLoading, error } = api.post.getAll.useQuery();

  console.log(api);
  useEffect(() => {
    if (!session) {
      router.push("/");
    }
  }, [session, router]);

  if (isLoading) {
    return <div></div>;
  }

  if (error) {
    return <div>Error loading trips: {error.message}</div>;
  }

  return (
    <main className="flex min-h-screen w-full bg-gray-100 text-black">
      <MaxWidthWrapper>
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

        {trips!.length === 0 ? (
          <div className="flex space-x-4">
            <h2>Don't have any trips yet? Let's add one</h2>
            <Button onClick={() => router.push("/trip/add")}>Add Trip</Button>
          </div>
        ) : (
          <div className="flex space-x-4">
            <h2>Your Trips:</h2>
            <Button onClick={() => router.push("/trip/add")}>Add Trip</Button>
          </div>
        )}
        <div className="mt-6">
          {trips!.length === 0 ? (
            <p>No trips found.</p>
          ) : (
            trips!.map((trip: Trip) => (
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
                  <Button
                    onClick={() => router.push(`/trip/edit/${trip.id}`)}
                    className="mt-4"
                  >
                    Edit Trip
                  </Button>
                </div>
                <div className="mt-8 md:mt-0">
                  <h4>Flight Info</h4>
                  <p>Flight Number: {trip.flightNumber}</p>
                  <h4>Accomodation</h4>
                  <p>Hotel Details: {trip.hotelDetails}</p>
                  <div className="flex justify-start gap-x-2 md:justify-center">
                    <p className="font-bold">From:</p>
                    <p>{trip.startDate}</p>
                    <p className="font-bold">To:</p>
                    <p>{trip.endDate}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </MaxWidthWrapper>
    </main>
  );
};

export default Dashboard;
