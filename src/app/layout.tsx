import "@/styles/globals.css";

// Poppins font for whole project
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-poppins",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

// Components

import Footer from "@/components/Footer";
import Provider from "@/components/Provider";

// Meta
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Travel Planner",
  description: "Plan your travels with ease. by ZGDGZ",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

// TRPC
import { TRPCReactProvider } from "@/trpc/react";

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
