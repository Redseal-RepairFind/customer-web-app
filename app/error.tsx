"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col py-12 px-4 items-center justify-center min-h-[600px] gap-5">
      <span className="flex items-center gap-3">
        <h1 className="text-gray-600 text-3xl font-bold">Error</h1>-
        <h2>An Error Occured</h2>
      </span>
      <p>{error.message}</p>
      <p>
        <button
          className="bg-gray-600 py-2 px-4 rounded-md  text-purple-100 cursor-pointer"
          onClick={reset}
        >
          Refresh
        </button>
      </p>
    </div>
  );
}
