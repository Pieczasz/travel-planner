"use client";

import { HydrateClient } from "@/trpc/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import Image from "next/image";

import { useSession } from "next-auth/react";

import { useRouter } from "next/navigation";

export default function Home() {
  const session = useSession();

  const router = useRouter();

  if (session) {
    router.push("/dashboard");
  }

  return (
    <HydrateClient>
      <main className="flex min-h-screen w-full bg-gray-100 text-black">
        <MaxWidthWrapper className="flex w-full max-w-screen-xl flex-col items-center justify-center px-4 py-12">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <h1 className="text-7xl font-extrabold text-blue-900">
              Plan Your Next Trip with TraPla
            </h1>
            <h4 className="text-lg text-gray-700">
              Discover and organize your perfect trip effortlessly. No costs, no
              hassles—just adventure! We are here to provide you everything you
              know to prepare for your next adventure. Let&apos;s plan!
            </h4>
            <Button className="mb-20">
              <Link href={session ? "/dashboard" : "/api/auth/signin"}>
                Start Planning Right Now!
              </Link>
            </Button>
            <Image
              src="/TravelPlanner.svg"
              alt="Travel Planner Logo"
              width={350}
              height={350}
              className="mt-20 object-contain"
            />
          </div>
        </MaxWidthWrapper>
      </main>
    </HydrateClient>
  );
}
