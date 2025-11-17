"use client";

import React, { useEffect, useMemo, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { PickersDay } from "@mui/x-date-pickers/PickersDay";
import { MultiSectionDigitalClock } from "@mui/x-date-pickers/MultiSectionDigitalClock";

dayjs.extend(customParseFormat);

/** ========= API types (match your payload) ========= */
export type SlotItem = {
  date: string; // e.g. "2025-11-03T00:00:00"
  type?: "available" | string; // we will only accept "available"
  times: string[]; // e.g. ["13:00:00","13:30:00",...]
};

export type ApiMonthBucket = {
  schedules: SlotItem[];
  // your payload may also contain other keys like `events`, `inspection_booked`, `summary` — ignored here
};

export type ApiSchedulesResponse = {
  data: Record<string, ApiMonthBucket>; // { "YYYY-MM": { schedules: [...] }, ... }
};

/** Optional flat shape if you want to pass it directly */
export type SlotsResponse = SlotItem[];

/** Internal normalized map: "YYYY-MM-DD" -> ["HH:mm", ...] */
type DateKey = string;
type HHmm = string;
type SlotsMap = Record<DateKey, readonly HHmm[]>;

type Props = {
  /** You can pass either the whole API object or just the `data` map; both work */
  api?: ApiSchedulesResponse | Record<string, ApiMonthBucket>;
  /** Or pass a flat array of slots (optional alternative) */
  slots?: SlotsResponse;

  /** Controlled values */
  date: Dayjs | null;
  time: Dayjs | null;

  /** Controlled handlers */
  onDateChange: (d: Dayjs | null) => void;
  onTimeChange: (t: Dayjs | null) => void;

  /** Show 12h clock if true (default false = 24h) */
  ampm?: boolean;

  /** Keep poppers inside modals (default true for react-responsive-modal) */
  disablePortal?: boolean;

  /** Optional labels */
  labelDate?: string;
  labelTime?: string;

  /** Auto-snap time to first available when date changes (default true) */
  autoSnap?: boolean;

  /** Optional classNames for layout */
  classNameDateWrapper?: string;
  classNameTimeWrapper?: string;
};

const DATE_KEY_FMT = "YYYY-MM-DD" as const;
const DATE_INPUT_FORMATS: readonly string[] = [
  "YYYY-MM-DDTHH:mm:ss",
  "YYYY-MM-DDTHH:mm",
  "YYYY-MM-DD",
] as const;

/** ========= Helpers ========= */

/** Accept `api` as either { data: {...} } or directly the month map */
function getMonthMap(
  api?: ApiSchedulesResponse | Record<string, ApiMonthBucket>
): Record<string, ApiMonthBucket> | null {
  if (!api) return null;
  // If it's the wrapper shape
  if (
    (api as ApiSchedulesResponse).data &&
    typeof (api as ApiSchedulesResponse).data === "object"
  ) {
    return (api as ApiSchedulesResponse).data;
  }
  // If it's directly the map
  return api as Record<string, ApiMonthBucket>;
}

/** Flatten month buckets to a simple array */
function flattenApi(
  api?: ApiSchedulesResponse | Record<string, ApiMonthBucket>
): SlotsResponse {
  const monthMap = getMonthMap(api);
  if (!monthMap) return [];
  const items: SlotItem[] = [];
  for (const monthKey of Object.keys(monthMap)) {
    const bucket = monthMap[monthKey];
    if (!bucket?.schedules?.length) continue;
    for (const s of bucket.schedules) {
      if (s && Array.isArray(s.times)) items.push(s);
    }
  }
  return items;
}

/** Build "YYYY-MM-DD" -> ["HH:mm"] (unique, sorted), strict parsing, only type="available" */
function buildSlotsMap(src: {
  api?: ApiSchedulesResponse | Record<string, ApiMonthBucket>;
  slots?: SlotsResponse;
}): SlotsMap {
  const base: SlotsResponse = src.slots ?? flattenApi(src.api);
  const out: SlotsMap = {};

  for (const it of base) {
    if (!it?.date || !Array.isArray(it.times)) continue;
    if (it.type && it.type !== "available") continue; // ONLY available

    // strict parse of API date string
    const day = dayjs(it.date, DATE_INPUT_FORMATS as string[], true);
    if (!day.isValid()) continue;

    const key: DateKey = day.format(DATE_KEY_FMT);

    // normalize each time to "HH:mm" (from "HH:mm:ss" etc.), strict
    const hhmm: HHmm[] = Array.from(
      new Set(
        it.times
          .map((t) => {
            const parsed = dayjs(t, "HH:mm:ss", true).isValid()
              ? dayjs(t, "HH:mm:ss", true)
              : dayjs(t, ["HH:mm", "H:mm", "hh:mm A", "h:mm A"], true);
            return parsed.isValid() ? parsed.format("HH:mm") : null;
          })
          .filter((x): x is string => Boolean(x))
      )
    ).sort((a, b) => (a < b ? -1 : 1));

    if (hhmm.length) out[key] = hhmm;
  }

  return out;
}

/** Index minutes by hour for one day's times */
function indexMinutesByHour(timesHHmm: readonly HHmm[]) {
  const byHour = new Map<number, Set<number>>();
  const hours = new Set<number>();

  for (const t of timesHHmm) {
    const d = dayjs(t, "HH:mm", true);
    if (!d.isValid()) continue;
    const h = d.hour();
    const m = d.minute();
    hours.add(h);
    if (!byHour.has(h)) byHour.set(h, new Set<number>());
    byHour.get(h)!.add(m);
  }

  const sortedHours = Array.from(hours).sort((a, b) => a - b);
  const firstHour = sortedHours[0] ?? null;
  const firstMinute =
    firstHour != null ? Math.min(...Array.from(byHour.get(firstHour)!)) : null;

  return { byHour, hours: new Set(sortedHours), firstHour, firstMinute };
}

/** Public helper to combine date + time into ISO string (for your API) */
export function combineDateTimeISO(
  date: Dayjs | null,
  time: Dayjs | null
): string {
  if (!date) return "";
  const base = date.clone();
  const withTime = time
    ? base.hour(time.hour()).minute(time.minute()).second(0).millisecond(0)
    : base.startOf("day");
  return withTime.toISOString();
}

/** ========= Component ========= */
const RestrictedDateTimePicker: React.FC<Props> = ({
  api,
  slots,
  date,
  time,
  onDateChange,
  onTimeChange,
  ampm = false,
  disablePortal = true,
  labelDate = "",
  labelTime = "",
  autoSnap = true,
  classNameDateWrapper,
  classNameTimeWrapper,
}) => {
  const slotsMap = useMemo(() => buildSlotsMap({ api, slots }), [api, slots]);

  // Optional: bound calendar to earliest/latest available date
  const availableKeys = useMemo(() => Object.keys(slotsMap).sort(), [slotsMap]);
  const minDate = useMemo(
    () =>
      availableKeys.length ? dayjs(availableKeys[0], DATE_KEY_FMT) : undefined,
    [availableKeys]
  );
  const maxDate = useMemo(
    () =>
      availableKeys.length
        ? dayjs(availableKeys[availableKeys.length - 1], DATE_KEY_FMT)
        : undefined,
    [availableKeys]
  );

  const [open, setOpen] = useState<{ date: boolean; time: boolean }>({
    date: false,
    time: false,
  });

  // Ensure time stays valid for selected date; auto-snap if needed
  useEffect(() => {
    if (!autoSnap || !date) return;

    const key = date.format(DATE_KEY_FMT);
    const times = slotsMap[key] ?? [];

    if (!times.length) {
      if (time) onTimeChange(null);
      return;
    }

    if (!time) {
      onTimeChange(dayjs(times[0], "HH:mm"));
      return;
    }

    const hhmm = time.format("HH:mm");
    if (!times.includes(hhmm)) {
      onTimeChange(dayjs(times[0], "HH:mm"));
    }
  }, [autoSnap, date, onTimeChange, slotsMap, time]);

  const allowedTimesForDate: readonly HHmm[] = useMemo(() => {
    if (!date) return [];
    return slotsMap[date.format(DATE_KEY_FMT)] ?? [];
  }, [date, slotsMap]);

  /** Version-agnostic props type for PickersDay */
  type DayProps = React.ComponentProps<typeof PickersDay>;

  /** Custom day renderer: strike-through & dim unavailable days */
  const DayWithStrike: React.FC<DayProps> = (props) => {
    const { day, outsideCurrentMonth } = props;
    const d = day as unknown as Dayjs; // AdapterDayjs guarantees Dayjs instance
    const isAllowed = !!slotsMap[d.format(DATE_KEY_FMT)];

    return (
      <PickersDay
        {...props}
        outsideCurrentMonth={outsideCurrentMonth}
        sx={
          isAllowed
            ? undefined
            : { textDecoration: "line-through", opacity: 0.45 }
        }
      />
    );
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      {/* Date */}
      <div className={classNameDateWrapper}>
        <DatePicker
          label={labelDate}
          value={date}
          onChange={(newDate) => {
            onDateChange(newDate);
            if (!autoSnap) return;

            const key = newDate ? newDate.format(DATE_KEY_FMT) : "";
            const times = key ? slotsMap[key] ?? [] : [];
            if (!times.length) {
              onTimeChange(null);
            } else {
              const keep =
                time && times.includes(time.format("HH:mm"))
                  ? time
                  : dayjs(times[0], "HH:mm");
              onTimeChange(keep);
            }
          }}
          shouldDisableDate={(d) => !slotsMap[d.format(DATE_KEY_FMT)]} // only "available" dates are enabled
          minDate={minDate}
          maxDate={maxDate}
          slots={{ day: DayWithStrike }}
          open={open.date}
          onClose={() => setOpen((op) => ({ ...op, date: false }))}
          slotProps={{
            textField: {
              fullWidth: true,
              onClick: () => setOpen({ date: true, time: false }),
              inputProps: { readOnly: true }, // prevent free typing
              InputProps: { sx: { color: "text.primary" } },
            } as any,
            popper: { disablePortal },
          }}
        />
      </div>

      {/* Time */}
      <div className={classNameTimeWrapper}>
        <TimePicker
          label={labelTime}
          value={time}
          onChange={(newTime) => onTimeChange(newTime)}
          ampm={ampm}
          views={["hours", "minutes"]}
          disabled={!date || !allowedTimesForDate.length}
          timeSteps={{ hours: 1, minutes: 1 }} // ensure every minute is considered
          // keep your existing disabling logic
          shouldDisableTime={(candidate, view) => {
            if (!date) return true;

            const times = allowedTimesForDate;
            if (!times.length) return true;

            const { byHour, hours, firstHour } = indexMinutesByHour(times);

            if (view === "hours") {
              // unchanged: disable hours not allowed
              return !hours.has(candidate.hour());
            }

            if (view === "minutes") {
              // only minutes allowed for the current hour stay enabled
              const currentHour =
                (time?.isValid() ? time.hour() : firstHour) ?? candidate.hour();
              const allowedMinutes = byHour.get(currentHour);
              if (!allowedMinutes) return true;
              return !allowedMinutes.has(candidate.minute());
            }

            return false;
          }}
          // NEW: hide disabled minutes (hours remain visible as-is)
          viewRenderers={{
            minutes: (props) => (
              <MultiSectionDigitalClock
                {...props}
                view="minutes"
                skipDisabled // ← hides minutes disabled by shouldDisableTime
              />
            ),
          }}
          open={open.time}
          onClose={() => setOpen((op) => ({ ...op, time: false }))}
          slotProps={{
            textField: {
              fullWidth: true,
              onClick: () => setOpen({ date: false, time: true }),
              inputProps: { readOnly: true },
            } as any,
            popper: { disablePortal },
          }}
        />
      </div>
    </LocalizationProvider>
  );
};

export default RestrictedDateTimePicker;
