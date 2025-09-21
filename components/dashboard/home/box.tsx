"use client";

import React, { ReactNode } from "react";

const Box = ({
  children,
  className,
  px = "px-2 lg:px-4",
  clickable,
  onClick,
}: {
  children: ReactNode;
  className?: string;
  px?: string;
  clickable?: boolean;
  onClick?: () => void;
}) => {
  if (clickable)
    return (
      <button
        className={`border border-light-10 rounded-lg ${px} py-2 ${className} cursor-pointer`}
        onClick={onClick}
      >
        {children}
      </button>
    );
  return (
    <div
      className={`border border-light-10 rounded-lg ${px} py-2 ${className}`}
    >
      {children}
    </div>
  );
};

export default Box;
