// app/providers/CallEngineProvider.tsx
"use client";
import React, { createContext, useContext } from "react";
import { useCallEngine } from "@/hook/useCall";
import CallPortalContainer from "@/components/dashboard/inbox/call-container";
// import CallPortalContainer from "@/components/CallPortalContainer";

type Ctx = ReturnType<typeof useCallEngine> | null;
const CallCtx = createContext<Ctx>(null);

export function CallEngineProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID!;
  const engine = useCallEngine(appId);

  return (
    <CallCtx.Provider value={engine}>
      {children}
      {/* Always mounted; opens when engine.phase !== 'idle' */}
      <CallPortalContainer />
    </CallCtx.Provider>
  );
}

export const useCall = () => {
  const ctx = useContext(CallCtx);
  if (!ctx) throw new Error("useCall must be used inside CallEngineProvider");
  return ctx;
};
