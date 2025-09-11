import { useEffect } from "react";
import { onMessage } from "firebase/messaging";
import { generateToken, messaging } from "@/lib/firebase/firebase";
import { usePageNavigator } from "./navigator";
import { useToast } from "@/contexts/toast-contexts";
import Text from "@/components/ui/text";
import { readStringCookie, setCookie } from "@/lib/helpers";
import { notifications } from "@/lib/api/actions/dashboard-actions/dashboard/notifications";

export const useFCMNotifications = () => {
  const { curPathname } = usePageNavigator();
  const { warning } = useToast();

  useEffect(() => {
    let isMounted = true;

    const setupMessaging = async () => {
      try {
        const currentToken = await generateToken();
        if (!currentToken || !isMounted) return;

        const cookieToken = readStringCookie("fcm_device_token");

        // console.log(currentToken, "current");

        if (cookieToken !== currentToken) {
          // Submit the token
          await notifications.submitBrowserToken({
            deviceToken: currentToken,
            deviceType: "WEB",
          });

          console.log("token submitted successfully");

          // Save to cookie for future comparison
          setCookie("fcm_device_token", currentToken, 365);
        }

        // Listen for foreground push messages
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
