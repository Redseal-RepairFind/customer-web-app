"use client";

import { PLANSTYPE } from "@/components/dashboard/home/plan-log";
import { Subscription } from "@/utils/types";
import dayjs from "dayjs";
import { useState } from "react";

export const useSubCalc = (subscription: Subscription) => {
  const [st, setSt] = useState();
  const startDate = dayjs(subscription?.startDate ?? Date.now());
  const endDate = startDate.add(30, "day");

  // progress right now
  const now = dayjs();

  // % complete across the 30-day window (clamped 0–100)
  const totalDays = endDate.diff(startDate, "day", true); // 30
  const elapsedDays = now.diff(startDate, "day", true); // fractional
  const percentComplete = now.isBefore(startDate)
    ? 0
    : now.isAfter(endDate)
    ? 100
    : Math.min(100, Math.max(0, (elapsedDays / totalDays) * 100));

  // (optional) whole days done / left
  const daysCompleted = Math.max(0, Math.min(30, Math.floor(elapsedDays)));
  const daysLeft = Math.max(0, Math.ceil(endDate.diff(now, "day", true)));

  return {
    startDate,
    endDate,
    daysCompleted,
    daysLeft,
    percentComplete,
    st,
    setSt,
  };
};
