import "@/styles/globals.css";

import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-poppins",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

import { type Metadata } from "next";

import { TRPCReactProvider } from "@/trpc/react";
import Footer from "@/components/Footer";
import Provider from "@/components/Provider";

export const metadata: Metadata = {
  title: "Travel Planner",
  description: "Plan your travels with ease. by ZGDGZ",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${poppins.variable}`}>
      <body>
        <Provider>
          <TRPCReactProvider>{children}</TRPCReactProvider>
          <Footer />
        </Provider>
      </body>
    </html>
  );
}
