"use client";

// Functions
import React from "react";
import { useEffect } from "react";

import { useSession } from "next-auth/react";

import { useRouter } from "next/navigation";

// Components
import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import AddTripForm from "@/components/AddTripForm";

const AddTrip = () => {
  const { data: session } = useSession();
  const router = useRouter();

  // Redirect to dashboard if user isn't already authenticated
  useEffect(() => {
    if (!session) {
      router.push("/");
    }
  }, [session, router]);

  return (
    <main className="flex min-h-screen w-full bg-gray-100 text-black">
      <MaxWidthWrapper className="mt-20 flex flex-col items-center justify-center">
        <AddTripForm />
      </MaxWidthWrapper>
    </main>
  );
};

export default AddTrip;
