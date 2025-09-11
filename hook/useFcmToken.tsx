"use client";

import { useEffect } from "react";
import { usePageNavigator } from "./navigator";
import { useToast } from "@/contexts/toast-contexts";
import Text from "@/components/ui/text";
import { readStringCookie, setCookie } from "@/lib/helpers";
import { notifications } from "@/lib/api/actions/dashboard-actions/dashboard/notifications";

export const useFCMNotifications = () => {
  const { curPathname } = usePageNavigator();
  const { warning } = useToast();

  useEffect(() => {
    if (typeof window === "undefined") return;

    let isMounted = true;

    const setupMessaging = async () => {
      try {
        // Dynamically import Firebase stuff only in the browser
        const { generateToken, messaging } = await import(
          "@/lib/firebase/firebase"
        );
        const { onMessage } = await import("firebase/messaging");

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

        onMessage(messaging, (payload) => {
          if (!isMounted) return;
          warning({
            render: () => (
              <div>
                <Text.SubHeading>{payload.notification?.title}</Text.SubHeading>
                <Text.SubParagraph>
                  {payload.notification?.body}
                </Text.SubParagraph>
              </div>
            ),
            vars: { bg: "#ffffff", fg: "#000" },
          });
        });
      } catch (err) {
        console.error("FCM setup failed:", err);
      }
    };

    setupMessaging();

    return () => {
      isMounted = false;
    };
  }, []);
};
