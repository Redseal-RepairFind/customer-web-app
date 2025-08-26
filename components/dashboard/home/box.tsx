"use client";

import React, { ReactNode } from "react";

const Box = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={`border border-light-10 rounded-lg px-2 lg:px-4 py-2 ${className}`}
    >
      {children}
    </div>
  );
};

export default Box;
