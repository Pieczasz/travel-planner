import React from "react";

import { getServerAuthSession } from "@/server/auth";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";

const Page = async () => {
  const session = await getServerAuthSession();
  return (
    <main className="flex min-h-screen w-full bg-gray-100 text-black">
      <MaxWidthWrapper>
        <p></p>
      </MaxWidthWrapper>
    </main>
  );
};

export default Page;
