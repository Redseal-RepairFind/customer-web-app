"use client";

import { useLoadScript } from "@react-google-maps/api";
import LoadingTemplate from "./spinner";
import { useEffect, useState } from "react";

export const GoogleMapsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_MAP_API_KEY!,
    libraries: ["places"],
  });

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Before hydration, just render nothing (or a stable div)
  if (!mounted) {
    return <div />;
  }

  if (!isLoaded) {
    return <LoadingTemplate />;
  }

  return <>{children}</>;
};
