import type { Metadata } from "next";

import "@/styles/globals.css";
import { Jost } from "next/font/google";
import MainLayout from "@/components/ui/main-layout";
import { GoogleMapsProvider } from "@/components/ui/google-maps-provider";
import { ToastProvider } from "@/contexts/toast-contexts";
import { ClientToaster } from "@/components/ui/client-toast";

const jost = Jost({
  subsets: ["latin"],
  variable: "--font-jost", // creates a CSS variable
});

export const metadata: Metadata = {
  title: {
    default: "Repairfind Premium Customer",
    template: "Repairfind Premium Customer | %s",
  },
  description: "Repairfind Premium Customer Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={jost.variable}>
      <body className="antialiased min-h-dvh flex-col flex justify-between">
        <ToastProvider placement="top-center">
          <MainLayout>
            <GoogleMapsProvider>{children}</GoogleMapsProvider>
          </MainLayout>
        </ToastProvider>

        <ClientToaster />
      </body>
    </html>
  );
}

//
