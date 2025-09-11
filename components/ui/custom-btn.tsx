"use client";

import * as React from "react";

type BaseProps<E extends HTMLElement = HTMLElement> =
  React.HTMLAttributes<E> & { className?: string };

type Variant =
  | "primary"
  | "secondary"
  | "secondary_2"
  | "tertiary"
  | "danger"
  | "danger_filled"
  | "green";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  border?: boolean;
};

type ButtonCompound = React.FC<ButtonProps> & {
  Icon: React.FC<BaseProps<HTMLSpanElement>>;
  Text: React.FC<BaseProps<HTMLSpanElement>>;
};

/* Utils */
function cx(...classes: Array<string | undefined | false | null>) {
  return classes.filter(Boolean).join(" ");
}

/* Root */
function ButtonBase({
  className,
  variant = "primary",
  disabled,
  children,
  ...rest
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-md px-2 sm:px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed";

  const variants: Record<Variant, string> = {
    primary: `bg-black text-white border border-transparent hover:bg-black/90 hover:text-dark-500 transition-all duration-300 cursor-pointer ${
      rest.border ? "border border-white" : ""
    }`,
    secondary:
      "bg-white text-black border border-black hover:bg-black/5 hover:text-black transition-all duration-300 cursor-pointer",
    secondary_2:
      "bg-white text-green-main border border-green-main hover:bg-green-main hover:text-white transition-all duration-300 cursor-pointer",
    danger:
      "bg-white text-red-500 border border-red-500 hover:bg-red-500 hover:text-white transition-all duration-300 cursor-pointer",
    danger_filled:
      "bg-red-500 text-white  hover:bg-red-500/5 hover:text-white transition-all duration-300 cursor-pointer",
    green:
      "bg-green-main text-white border border-green-main hover:bg-green-main/5 hover:text-green-main transition-all duration-300 cursor-pointer",

    tertiary:
      "bg-white text-black  hover:bg-black hover:text-white transition-all duration-300 cursor-pointer",
  };

  return (
    <button
      className={cx(base, variants[variant], className)}
      disabled={disabled}
      {...rest}
      type={rest.type || "button"}
    >
      {children}
    </button>
  );
}
ButtonBase.displayName = "Button";

/* Subcomponents */
function ButtonIcon({ className, ...props }: BaseProps<HTMLSpanElement>) {
  return <span className={cx("inline-flex shrink-0", className)} {...props} />;
}
ButtonIcon.displayName = "Button.Icon";

function ButtonText({ className, ...props }: BaseProps<HTMLSpanElement>) {
  return <p className={cx("truncate", className)} {...props} />;
}
ButtonText.displayName = "Button.Text";

/* Compound export */
const Button = Object.assign(ButtonBase, {
  Icon: ButtonIcon,
  Text: ButtonText,
}) as ButtonCompound;

export default Button;
