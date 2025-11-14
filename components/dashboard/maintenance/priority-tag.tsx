"use client";

import * as React from "react";
import clsx from "clsx";

/** Maintenance status union from your app */
export type MaintenanceStatus =
  | "BOOKED"
  | "ONGOING"
  | "COMPLETED"
  | "DISPUTED"
  | "CANCELED"
  | "REFUNDED"
  | "EXPIRED"
  | "PENDING";

type Variant = "solid" | "soft" | "outline";
type Size = "sm" | "md";

type BaseTagProps = {
  children?: React.ReactNode;
  /** If you pass onClick, it renders a <button>; otherwise a <span> */
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  className?: string;
  variant?: Variant;
  size?: Size;
  /** Show a small colored dot on the left */
  dot?: boolean;
  /** Optional icon element at the left */
  iconLeft?: React.ReactNode;
  /** Optional icon element at the right */
  iconRight?: React.ReactNode;
  /** For accessibility on clickable tags */
  ariaLabel?: string;
  /** Color key chooses the palette below */
  color?:
    | "gray"
    | "blue"
    | "green"
    | "red"
    | "amber"
    | "purple"
    | "indigo"
    | "slate";
};

/** Tailwind palettes per color + variant */
const PALETTE: Record<
  NonNullable<BaseTagProps["color"]>,
  {
    solid: string;
    soft: string;
    outline: string;
    dot: string;
    textOnSolid: string;
    textOnSoft: string;
  }
> = {
  gray: {
    solid:
      "bg-gray-900 text-white hover:bg-gray-800 focus-visible:ring-gray-400",
    soft: "bg-gray-100 text-gray-800 hover:bg-gray-200 focus-visible:ring-gray-300",
    outline:
      "border border-gray-300 text-gray-800 hover:bg-gray-50 focus-visible:ring-gray-300",
    dot: "bg-gray-500",
    textOnSolid: "text-white",
    textOnSoft: "text-gray-800",
  },
  blue: {
    solid:
      "bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-400",
    soft: "bg-blue-50 text-blue-700 hover:bg-blue-100 focus-visible:ring-blue-300",
    outline:
      "border border-blue-300 text-blue-700 hover:bg-blue-50 focus-visible:ring-blue-300",
    dot: "bg-blue-500",
    textOnSolid: "text-white",
    textOnSoft: "text-blue-700",
  },
  green: {
    solid:
      "bg-green-600 text-white hover:bg-green-700 focus-visible:ring-green-400",
    soft: "bg-green-50 text-green-700 hover:bg-green-100 focus-visible:ring-green-300",
    outline:
      "border border-green-300 text-green-700 hover:bg-green-50 focus-visible:ring-green-300",
    dot: "bg-green-500",
    textOnSolid: "text-white",
    textOnSoft: "text-green-700",
  },
  red: {
    solid: "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-400",
    soft: "bg-red-50 text-red-700 hover:bg-red-100 focus-visible:ring-red-300",
    outline:
      "border border-red-300 text-red-700 hover:bg-red-50 focus-visible:ring-red-300",
    dot: "bg-red-500",
    textOnSolid: "text-white",
    textOnSoft: "text-red-700",
  },
  amber: {
    solid:
      "bg-amber-600 text-white hover:bg-amber-700 focus-visible:ring-amber-400",
    soft: "bg-amber-50 text-amber-700 hover:bg-amber-100 focus-visible:ring-amber-300",
    outline:
      "border border-amber-300 text-amber-700 hover:bg-amber-50 focus-visible:ring-amber-300",
    dot: "bg-amber-500",
    textOnSolid: "text-white",
    textOnSoft: "text-amber-700",
  },
  purple: {
    solid:
      "bg-purple-600 text-white hover:bg-purple-700 focus-visible:ring-purple-400",
    soft: "bg-purple-50 text-purple-700 hover:bg-purple-100 focus-visible:ring-purple-300",
    outline:
      "border border-purple-300 text-purple-700 hover:bg-purple-50 focus-visible:ring-purple-300",
    dot: "bg-purple-500",
    textOnSolid: "text-white",
    textOnSoft: "text-purple-700",
  },
  indigo: {
    solid:
      "bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:ring-indigo-400",
    soft: "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 focus-visible:ring-indigo-300",
    outline:
      "border border-indigo-300 text-indigo-700 hover:bg-indigo-50 focus-visible:ring-indigo-300",
    dot: "bg-indigo-500",
    textOnSolid: "text-white",
    textOnSoft: "text-indigo-700",
  },
  slate: {
    solid:
      "bg-slate-700 text-white hover:bg-slate-800 focus-visible:ring-slate-400",
    soft: "bg-slate-100 text-slate-700 hover:bg-slate-200 focus-visible:ring-slate-300",
    outline:
      "border border-slate-300 text-slate-700 hover:bg-slate-50 focus-visible:ring-slate-300",
    dot: "bg-slate-500",
    textOnSolid: "text-white",
    textOnSoft: "text-slate-700",
  },
};

const SIZE: Record<Size, string> = {
  sm: "h-6 px-2 text-[12px] rounded-full gap-1.5",
  md: "h-7 px-3 text-[13px] rounded-full gap-2",
};

export function Tag({
  children,
  onClick,
  className,
  variant = "soft",
  size = "sm",
  dot = false,
  iconLeft,
  iconRight,
  ariaLabel,
  color = "gray",
}: BaseTagProps) {
  const isButton = typeof onClick === "function";
  const palette = PALETTE[color];

  const base =
    "inline-flex items-center whitespace-nowrap select-none transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";
  const variantCls =
    variant === "solid"
      ? palette.solid
      : variant === "outline"
      ? palette.outline
      : palette.soft;

  const Comp: any = isButton ? "button" : "span";

  return (
    <Comp
      type={isButton ? "button" : undefined}
      onClick={onClick}
      aria-label={ariaLabel}
      className={clsx(base, SIZE[size], variantCls, className)}
    >
      {iconLeft ? (
        <span className="grid place-items-center">{iconLeft}</span>
      ) : null}
      {dot ? (
        <span
          className={clsx("inline-block w-1.5 h-1.5 rounded-full", palette.dot)}
        />
      ) : null}
      <span className="leading-none">{children}</span>
      {iconRight ? (
        <span className="grid place-items-center">{iconRight}</span>
      ) : null}
    </Comp>
  );
}

/** Map statuses -> colors & default labels */
const STATUS_STYLE: Record<
  MaintenanceStatus,
  { color: BaseTagProps["color"]; label: string }
> = {
  BOOKED: { color: "blue", label: "Booked" },
  ONGOING: { color: "amber", label: "Ongoing" },
  COMPLETED: { color: "green", label: "Completed" },
  DISPUTED: { color: "red", label: "Disputed" },
  CANCELED: { color: "slate", label: "Canceled" },
  REFUNDED: { color: "purple", label: "Refunded" },
  EXPIRED: { color: "slate", label: "Expired" },
  PENDING: { color: "amber", label: "Pending" },
};

export function StatusTag({
  status,
  variant = "soft",
  size = "sm",
  withDot = false,
  className,
}: {
  status: MaintenanceStatus;
  variant?: Variant;
  size?: Size;
  withDot?: boolean;
  className?: string;
}) {
  const style = STATUS_STYLE[status];
  return (
    <Tag
      color={style.color}
      variant={variant}
      size={size}
      dot={withDot}
      className={className}
    >
      {style.label}
    </Tag>
  );
}

export function PriorityTag({
  priority,
  variant = "soft",
  size = "sm",
  className,
}: {
  priority: "High" | "Medium" | "Low";
  variant?: Variant;
  size?: Size;
  className?: string;
}) {
  const color =
    priority === "High" ? "red" : priority === "Medium" ? "amber" : "green";
  return (
    <Tag color={color} variant={variant} size={size} dot className={className}>
      {priority} Priority
    </Tag>
  );
}

/** Generic label tag for “Scheduled”, “Warranty Covered”, etc. */
export function LabelTag({
  label,
  color = "indigo",
  variant = "soft",
  size = "sm",
  className,
}: {
  label: string;
  color?: BaseTagProps["color"];
  variant?: Variant;
  size?: Size;
  className?: string;
}) {
  return (
    <Tag color={color} variant={variant} size={size} className={className}>
      {label}
    </Tag>
  );
}
