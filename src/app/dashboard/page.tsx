"use client";

import React from "react";

import { HydrateClient } from "@/trpc/server";

import MaxWidthWrapper from "@/components/MaxWidthWrapper";

import { useSession } from "next-auth/react";

import { useRouter } from "next/navigation";

import { useEffect } from "react";
const Page = () => {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.push("/dashboard");
    }
  }, [session, router]);

  return (
    <HydrateClient>
      <main className="flex min-h-screen w-full bg-gray-100 text-black">
        <MaxWidthWrapper>
          <p>asd</p>
        </MaxWidthWrapper>
      </main>
    </HydrateClient>
  );
};

export default Page;
