import type { Metadata } from "next";

import "@/styles/globals.css";
import { Jost } from "next/font/google";
import MainLayout from "@/components/ui/main-layout";
import { GoogleMapsProvider } from "@/components/ui/google-maps-provider";
import { Toaster } from "react-hot-toast";
import { ToastProvider } from "@/contexts/toast-contexts";

const jost = Jost({
  subsets: ["latin"],
  variable: "--font-jost", // creates a CSS variable you can use
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
    <html lang="en">
      <body
        className={`${jost.variable}  antialiased min-h-dvh flex-col flex justify-between`}
      >
        <ToastProvider>
          <MainLayout>
            <GoogleMapsProvider>{children}</GoogleMapsProvider>
          </MainLayout>
        </ToastProvider>

        <Toaster
          toastOptions={{
            style: {
              fontFamily: "'Jost', sans-serif",
              fontSize: "12px",
              fontWeight: "700",
            },
            success: {
              iconTheme: {
                primary: "#000000",
                secondary: "#ffffff",
              },
            },
          }}
        />
      </body>
    </html>
  );
}
