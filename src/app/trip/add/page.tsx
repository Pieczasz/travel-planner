"use client";

import React from "react";

import MaxWidthWrapper from "@/components/MaxWidthWrapper";

import { useSession } from "next-auth/react";

import { useRouter } from "next/navigation";

import { useEffect } from "react";

import AddTripForm from "@/components/AddTripForm";
const AddTrip = () => {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!session) {
      router.push("/");
    }
  }, [session, router]);

  return (
    <main className="flex min-h-screen w-full bg-gray-100 text-black">
      <MaxWidthWrapper>
        <h2>Add your trip!</h2>
        <AddTripForm />
      </MaxWidthWrapper>
    </main>
  );
};

export default AddTrip;
