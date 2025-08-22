// components/GoogleMapsProvider.tsx
"use client";

import { useLoadScript } from "@react-google-maps/api";
import LoadingTemplate from "./spinner";

export const GoogleMapsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  // const { mapAipKey } = envConfig;

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_MAP_API_KEY!,
    libraries: ["places"],
  });

  if (!isLoaded) return <LoadingTemplate />;

  return <>{children}</>;
};
