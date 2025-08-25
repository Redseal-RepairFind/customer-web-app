"use client";
// import CustomBtn from "@/components/ui/button";

// Error boundaries must be Client Components

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    // global-error must include html and body tags
    <html>
      <body className="flex items-center justify-center flex-col gap-5 h-screen">
        <h2 className="text-myblack-0 text-dark-500">Something went wrong!</h2>
        <p className="text-myblue-400 text-dark-500">{error?.message}</p>
        <button onClick={() => reset()}>Try again</button>
      </body>
    </html>
  );
}
