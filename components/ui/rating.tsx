"use client";
import React from "react";

type CommonProps = {
  max?: number; // number of stars
  precision?: number; // step size (e.g. 1, 0.5, 0.25)
  readOnly?: boolean;
  disabled?: boolean;
  name?: string; // form field name
  id?: string; // (optional) id base
  className?: string;
  size?: number; // star pixel size
  emptyLabel?: string; // SR label when 0 is allowed
  getLabelText?: (value: number, max: number) => string;
};

type Controlled = {
  value: number;
  defaultValue?: never;
  onChange: (next: number) => void;
};

type Uncontrolled = {
  value?: never;
  defaultValue?: number;
  onChange?: (next: number) => void;
};

type Props = CommonProps & (Controlled | Uncontrolled);

export const Rating: React.FC<Props> = ({
  value,
  defaultValue = 0,
  onChange,
  max = 5,
  precision = 1,
  readOnly = false,
  disabled = false,
  name,
  id,
  className,
  size = 16,
  emptyLabel = "No rating",
  getLabelText = (v, m) => `${v} of ${m} ${v === 1 ? "star" : "stars"}`,
}) => {
  // Build the discrete options: 0..max with `precision` step
  const steps: number[] = React.useMemo(() => {
    const out: number[] = [];
    const total = Math.round(max / precision);
    for (let i = 1; i <= total; i++) {
      out.push(parseFloat((i * precision).toFixed(6)));
    }
    return out;
  }, [max, precision]);

  const isControlled = value !== undefined;
  const [internal, setInternal] = React.useState(defaultValue);
  const current = isControlled ? (value as number) : internal;

  const groupId = id ?? `rating-${name ?? "field"}-${React.useId()}`;

  const handleChange = (next: number) => {
    if (!isControlled) setInternal(next);
    onChange?.(next);
  };

  return (
    <fieldset
      className={className}
      aria-disabled={disabled}
      aria-readonly={readOnly}
      role="radiogroup"
    >
      {/* Visually hidden legend for SRs */}
      <legend className="sr-only">{name ?? "Rating"}</legend>

      <div className="flex items-center gap-1">
        {/* Optional “clear” (0) when precision allows it */}
        {precision && !readOnly && !disabled ? (
          <VisuallyHiddenRadio
            id={`${groupId}-0`}
            name={name}
            checked={current === 0}
            onChange={() => handleChange(0)}
            disabled={disabled}
            label={emptyLabel}
          />
        ) : null}

        {steps.map((stepVal) => {
          const checked = Math.abs(current - stepVal) < 1e-6;
          const inputId = `${groupId}-${stepVal}`;
          const label = getLabelText(stepVal, max);
          return (
            <label
              key={stepVal}
              htmlFor={inputId}
              aria-label={label}
              className={`inline-flex cursor-pointer ${
                disabled || readOnly ? "cursor-not-allowed" : ""
              }`}
            >
              {/* The input controls accessibility/keyboard; the SVG gives visuals */}
              <input
                type="radio"
                id={inputId}
                name={name}
                className="sr-only"
                disabled={disabled}
                checked={checked}
                onChange={() => handleChange(stepVal)}
                value={stepVal}
                aria-checked={checked}
                aria-label={label}
                readOnly={readOnly}
                // If readOnly, keep focusable for SR reading but prevent changes:
                onKeyDown={readOnly ? (e) => e.preventDefault() : undefined}
              />
              <Star
                size={size}
                fillPercent={starFillPercent(stepVal, current, precision)}
                inactive={disabled || readOnly}
              />
            </label>
          );
        })}
      </div>
    </fieldset>
  );
};

/**
 * Compute how much of this star should be filled based on the current rating.
 * For example with precision=0.5, selecting 3.5 fills the first 3 fully and the 4th at 50%.
 */
function starFillPercent(
  starValue: number,
  current: number,
  precision: number
) {
  // Which star index (1..max) does starValue belong to?
  // e.g. for precision 0.5, values 1.0 & 1.5 both belong to star #1.
  const starIndex = Math.ceil(starValue);
  const fullForStar = Math.min(Math.max(current - (starIndex - 1), 0), 1);
  return Math.round(fullForStar * 100);
}

/** A single star with partial fill using an overlay mask. */
const Star: React.FC<{
  size: number;
  fillPercent: number;
  inactive?: boolean;
}> = ({ size, fillPercent, inactive = false }) => {
  const px = Math.max(16, size);
  return (
    <span
      aria-hidden="true"
      className="relative inline-block"
      style={{ width: px, height: px, lineHeight: 0 }}
    >
      {/* Base (empty) star */}
      <svg
        width={px}
        height={px}
        viewBox="0 0 24 24"
        className="block"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.6 5.82 22 7 14.14 2 9.27l6.91-1.01L12 2z"
          fill={inactive ? "#E5E7EB" : "#E5E7EB"} /* gray-200 */
        />
      </svg>

      {/* Filled overlay clipped by width percentage */}
      <span
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${fillPercent}%` }}
      >
        <svg
          width={px}
          height={px}
          viewBox="0 0 24 24"
          className="block"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.6 5.82 22 7 14.14 2 9.27l6.91-1.01L12 2z"
            fill={"#F59E0B"} /* gray-400 or amber-500 */
          />
        </svg>
      </span>
    </span>
  );
};

/** Screen-reader-only radio for “clear rating” option */
const VisuallyHiddenRadio: React.FC<{
  id: string;
  name?: string;
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  label: string;
}> = ({ id, name, checked, onChange, disabled, label }) => {
  return (
    <div>
      <input
        id={id}
        className="sr-only"
        type="radio"
        name={name}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        value={0}
        aria-label={label}
      />
    </div>
  );
};
