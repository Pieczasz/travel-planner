"use client";

import React from "react";

import MaxWidthWrapper from "@/components/MaxWidthWrapper";

import { useSession } from "next-auth/react";

import { useRouter } from "next/navigation";

import { useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
const Dashboard = () => {
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
        <h2>Hi! {session?.user?.name}</h2>
        <Image
          src={session?.user?.image ?? "/default-profile-image.jpg"}
          alt="Profile"
          width={200}
          height={200}
        />
        <Button onClick={() => router.push("/trip/add")}>Add Trip</Button>
      </MaxWidthWrapper>
    </main>
  );
};

export default Dashboard;
