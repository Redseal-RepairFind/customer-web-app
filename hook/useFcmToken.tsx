"use client";

import { useEffect } from "react";
import { usePageNavigator } from "./navigator";
import { useToast } from "@/contexts/toast-contexts";
import Text from "@/components/ui/text";
import { readStringCookie, setCookie } from "@/lib/helpers";
import { notifications } from "@/lib/api/actions/dashboard-actions/dashboard/notifications";
import { useNotificationSound } from "@/contexts/sound-provider";

export const useFCMNotifications = () => {
  const { curPathname } = usePageNavigator();
  const { warning } = useToast();
  const { play } = useNotificationSound();

  // Ask once for system notifications (optional but nice)
  useEffect(() => {
    if (typeof window === "undefined") return;
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let isMounted = true;
    let swMsgHandler: ((e: MessageEvent) => void) | null = null;

    const setupMessaging = async () => {
      try {
        // Only load Firebase on client
        const { generateToken, messaging } = await import(
          "@/lib/firebase/firebase"
        );
        const { onMessage } = await import("firebase/messaging");

        // Get/submit FCM token
        const currentToken = await generateToken();
        if (!currentToken || !isMounted) return;

        const cookieToken = readStringCookie("fcm_device_token");
        if (cookieToken !== currentToken) {
          await notifications.submitBrowserToken({
            deviceToken: currentToken,
            deviceType: "WEB",
          });
          setCookie("fcm_device_token", currentToken, 365);
        }

        // Foreground messages (tab is active)
        onMessage(messaging, (payload) => {
          if (!isMounted) return;

          // In-app toast
          warning({
            render: () => (
              <div>
                <Text.SmallText className="text-base font-semibold">
                  {payload.notification?.title ?? "Notification"}
                </Text.SmallText>
                <Text.SubParagraph className="text-sm">
                  {payload.notification?.body ?? ""}
                </Text.SubParagraph>
              </div>
            ),
            vars: { bg: "#ffffff", fg: "#000" },
          });

          // Optional: also trigger a system notification
          if (
            typeof Notification !== "undefined" &&
            Notification.permission === "granted"
          ) {
            new Notification(payload.notification?.title ?? "Notification", {
              body: payload.notification?.body ?? "",
            });
          }

          // 🔔 Custom sound
          play({ volume: 0.8 });
        });

        // Background SW → page bridge (custom sound if a page is open)
        swMsgHandler = (e: MessageEvent) => {
          if (e.data?.type === "FCM_PUSH") {
            // You can also surface a toast if you want:
            // warning({ title: e.data.payload?.notification?.title, ... })
            play({ volume: 0.8 });
          }
        };
        navigator.serviceWorker?.addEventListener("message", swMsgHandler);
      } catch (err) {
        console.error("FCM setup failed:", err);
      }
    };

    setupMessaging();

    return () => {
      isMounted = false;
      if (swMsgHandler)
        navigator.serviceWorker?.removeEventListener("message", swMsgHandler);
    };
  }, [warning, play, curPathname]);
};
