"use client";

import React, { useEffect, useMemo, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { PickersDay } from "@mui/x-date-pickers/PickersDay";

dayjs.extend(customParseFormat);

/** ========= API types (match your payload) ========= */
export type SlotItem = {
  date: string; // e.g. "2025-11-03T00:00:00"
  type?: "available" | string; // only "available" is selectable
  times: string[]; // e.g. ["13:00:00","13:30:00",...]
};

export type ApiMonthBucket = {
  schedules: SlotItem[];
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

  /** If falsey, only show DatePicker (no time) */
  includeTime?: boolean;
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
  if (
    (api as ApiSchedulesResponse).data &&
    typeof (api as ApiSchedulesResponse).data === "object"
  ) {
    return (api as ApiSchedulesResponse).data;
  }
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

/** Build 30-minute interval times between startHour and endHour inclusive of end:00 (no :30 past end) */
function buildHalfHourWindow(
  startHour: number,
  endHourInclusive: number
): readonly HHmm[] {
  const list: string[] = [];
  for (let h = startHour; h <= endHourInclusive; h++) {
    list.push(`${String(h).padStart(2, "0")}:00`);
    if (h < endHourInclusive) list.push(`${String(h).padStart(2, "0")}:30`);
  }
  return list;
}

function isWeekend(d: Dayjs): boolean {
  const dow = d.day(); // 0=Sun ... 6=Sat
  return dow === 0 || dow === 6;
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
  includeTime,
}) => {
  const slotsMap = useMemo(() => buildSlotsMap({ api, slots }), [api, slots]);

  // Today (weekday gets free 30-min intervals from 09:00 to 17:00)
  const today = useMemo(() => dayjs().startOf("day"), []);
  const todayKey = today.format(DATE_KEY_FMT);
  const halfHourToday9to5 = useMemo(() => buildHalfHourWindow(9, 17), []);

  // Bound calendar to earliest/latest available OR include today if outside
  const availableKeys = useMemo(() => Object.keys(slotsMap).sort(), [slotsMap]);
  const minAvail = useMemo(
    () =>
      availableKeys.length ? dayjs(availableKeys[0], DATE_KEY_FMT) : undefined,
    [availableKeys]
  );
  const maxAvail = useMemo(
    () =>
      availableKeys.length
        ? dayjs(availableKeys[availableKeys.length - 1], DATE_KEY_FMT)
        : undefined,
    [availableKeys]
  );

  const minDate = useMemo(() => {
    if (!minAvail) return today;
    return today.isBefore(minAvail, "day") ? today : minAvail;
  }, [minAvail, today]);

  const maxDate = useMemo(() => {
    if (!maxAvail) return today;
    return today.isAfter(maxAvail, "day") ? today : maxAvail;
  }, [maxAvail, today]);

  const [open, setOpen] = useState<{ date: boolean; time: boolean }>({
    date: false,
    time: false,
  });

  // Ensure time stays valid for selected date; auto-snap if needed
  useEffect(() => {
    if (!autoSnap || !date) return;

    const key = date.format(DATE_KEY_FMT);
    const isTodayWeekday = key === todayKey && !isWeekend(date);

    const times = isTodayWeekday ? halfHourToday9to5 : slotsMap[key] ?? [];

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
  }, [
    autoSnap,
    date,
    onTimeChange,
    slotsMap,
    time,
    todayKey,
    halfHourToday9to5,
  ]);

  const allowedTimesForDate: readonly HHmm[] = useMemo(() => {
    if (!date) return [];
    const key = date.format(DATE_KEY_FMT);
    if (isWeekend(date)) return []; // weekends disabled entirely
    if (key === todayKey) return halfHourToday9to5; // 9:00–17:00 in 30-min steps
    return slotsMap[key] ?? [];
  }, [date, slotsMap, todayKey, halfHourToday9to5]);

  /** Version-agnostic props type for PickersDay */
  type DayProps = React.ComponentProps<typeof PickersDay>;

  /** Custom day renderer: strike-through & dim — weekends OR not-allowed days; allow weekday "today" */
  const DayWithStrike: React.FC<DayProps> = (props) => {
    const { day, outsideCurrentMonth } = props;
    const d = day as unknown as Dayjs;
    const key = d.format(DATE_KEY_FMT);
    const weekend = isWeekend(d);
    const inApi = !!slotsMap[key];
    const isTodayWeekday = key === todayKey && !weekend;

    const strike = (weekend || !inApi) && !isTodayWeekday;

    return (
      <PickersDay
        {...props}
        outsideCurrentMonth={outsideCurrentMonth}
        sx={
          strike ? { textDecoration: "line-through", opacity: 0.45 } : undefined
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

            if (!newDate) {
              onTimeChange(null);
              return;
            }

            if (isWeekend(newDate)) {
              onTimeChange(null);
              return;
            }

            const key = newDate.format(DATE_KEY_FMT);
            const isTodayWeekday = key === todayKey && !isWeekend(newDate);
            const times = isTodayWeekday
              ? halfHourToday9to5
              : slotsMap[key] ?? [];

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
          // Weekends disabled; Weekday "today" always selectable; otherwise only API-available days
          shouldDisableDate={(d) => {
            if (isWeekend(d)) return true;
            const key = d.format(DATE_KEY_FMT);
            if (key === todayKey) return false;
            return !slotsMap[key];
          }}
          minDate={minDate}
          maxDate={maxDate}
          slots={{ day: DayWithStrike }}
          open={open.date}
          onClose={() => setOpen((op) => ({ ...op, date: false }))}
          slotProps={{
            textField: {
              fullWidth: true,
              onClick: () => setOpen({ date: true, time: false }),
              inputProps: { readOnly: true },
              InputProps: { sx: { color: "text.primary" } },
            } as any,
            popper: { disablePortal: true },
          }}
        />
      </div>

      {/* Time */}
      {includeTime && (
        <div className={classNameTimeWrapper}>
          <TimePicker
            label={labelTime}
            value={time}
            onChange={(newTime) => onTimeChange(newTime)}
            ampm={ampm}
            views={["hours", "minutes"]}
            minutesStep={30} // 30-minute UI stepping
            disabled={!date || !allowedTimesForDate.length}
            shouldDisableTime={(candidate, view) => {
              if (!date) return true;

              // If weekend, everything disabled
              if (isWeekend(date)) return true;

              const times = allowedTimesForDate;
              if (!times.length) return true;

              const { byHour, hours, firstHour } = indexMinutesByHour(times);

              if (view === "hours") {
                return !hours.has(candidate.hour());
              }

              if (view === "minutes") {
                const currentHour =
                  (time?.isValid() ? time.hour() : firstHour) ??
                  candidate.hour();
                const allowedMinutes = byHour.get(currentHour);
                if (!allowedMinutes) return true;
                return !allowedMinutes.has(candidate.minute());
              }

              return false; // seconds not used
            }}
            open={open.time}
            onClose={() => setOpen((op) => ({ ...op, time: false }))}
            slotProps={{
              textField: {
                fullWidth: true,
                onClick: () => setOpen({ date: false, time: true }),
                inputProps: { readOnly: true },
              } as any,
              popper: { disablePortal: true },
            }}
          />
        </div>
      )}
    </LocalizationProvider>
  );
};

export default RestrictedDateTimePicker;
