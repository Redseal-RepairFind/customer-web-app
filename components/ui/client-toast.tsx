// components/ui/client-toaster.tsx
"use client";
import { Toaster } from "react-hot-toast";

export function ClientToaster() {
  return (
    <Toaster
      toastOptions={{
        className: "font-jost text-xs font-bold",
        success: {
          iconTheme: { primary: "#000000", secondary: "#ffffff" },
        },
      }}
    />
  );
}
