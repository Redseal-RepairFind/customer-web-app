import type { Metadata } from "next";

import "@/styles/globals.css";
import { Jost } from "next/font/google";
import MainLayout from "@/components/ui/main-layout";
import { GoogleMapsProvider } from "@/components/ui/google-maps-provider";
import { Toaster } from "react-hot-toast";
import { ToastProvider } from "@/contexts/toast-contexts";

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
        <ToastProvider>
          <MainLayout>
            <GoogleMapsProvider>{children}</GoogleMapsProvider>
          </MainLayout>
        </ToastProvider>

        <Toaster
          toastOptions={{
            className: "font-jost text-xs font-bold",
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
