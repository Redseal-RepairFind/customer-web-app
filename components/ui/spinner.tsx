import React from "react";

const LoadingTemplate = ({
  isMessage = true,
  variant = "main",
}: {
  isMessage?: boolean;
  variant?: "main" | "small";
}) => {
  if (variant === "small")
    return (
      <div className="flex items-center justify-center absolute inset-1">
        <div className="flex items-center space-x-1 text-dark-50 z-[100]">
          <svg
            fill="none"
            className="w-6 h-6 animate-spin"
            viewBox="0 0 32 32"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              clipRule="evenodd"
              d="M15.165 8.53a.5.5 0 01-.404.58A7 7 0 1023 16a.5.5 0 011 0 8 8 0 11-9.416-7.874.5.5 0 01.58.404z"
              fill="currentColor"
              fillRule="evenodd"
            />
          </svg>

          {isMessage && <div className="">Loading ...</div>}
        </div>
      </div>
    );
  return (
    <div className="flex items-center justify-center absolute inset-1 bg-white z-50">
      <div className="flex items-center space-x-1 text-[#333] z-[100]">
        <svg
          fill="none"
          className="w-6 h-6 animate-spin"
          viewBox="0 0 32 32"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            clipRule="evenodd"
            d="M15.165 8.53a.5.5 0 01-.404.58A7 7 0 1023 16a.5.5 0 011 0 8 8 0 11-9.416-7.874.5.5 0 01.58.404z"
            fill="currentColor"
            fillRule="evenodd"
          />
        </svg>

        {isMessage && <div className="">Loading ...</div>}
      </div>
    </div>
  );
};

export default LoadingTemplate;
