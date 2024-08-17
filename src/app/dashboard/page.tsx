"use client";

import React from "react";

import MaxWidthWrapper from "@/components/MaxWidthWrapper";

import { useSession } from "next-auth/react";

import { useRouter } from "next/navigation";

const Page = () => {
  const session = useSession();

  const router = useRouter();

  if (!session) {
    router.push("/");
  }

  return (
    <main className="flex min-h-screen w-full bg-gray-100 text-black">
      <MaxWidthWrapper>
        <p>asd</p>
      </MaxWidthWrapper>
    </main>
  );
};

export default Page;
