"use client";
import { useNotification } from "@/hook/useNotification";
import SocketsService from "@/utils/socket";
import { NotificationsPayload, NotificationsResponse } from "@/utils/types";
import { createContext, useContext, useEffect, useState } from "react";

type SocketContextType = {
  socket: typeof SocketsService.socket;
  isConnected: boolean;
  badgeCount: NotificationsPayload | null;
  handleReadNotifs: (id: string) => void;
  badge: number;
  setBadge: (cnt: number) => void;
  openComplete: boolean;
  setOpenComplete: (cm: boolean) => void;
};

const SocketContext = createContext<SocketContextType>({
  socket: SocketsService.socket,
  isConnected: false,
  badgeCount: null,
  handleReadNotifs() {},
  badge: 0,
  setBadge() {},
  openComplete: false,
  setOpenComplete() {},
});

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [badgeCount, setBadgeCount] = useState<NotificationsPayload | null>(
    null
  );
  const { notificationBagde } = useNotification();
  const [badge, setBadge] = useState<number>(0);
  const [openComplete, setOpenComplete] = useState(false);
  const handleReadNotifs = async (id: string): Promise<void> => {
    SocketsService.sendData("mark_single_notification_as_read", { id });
    setBadge((bg) => bg > 0 && bg - 1);
  };

  useEffect(() => {
    SocketsService.connect();

    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);
    const handleRedDotAlert = (data: NotificationsResponse) => {
      setBadgeCount(data?.payload?.data);
      console.log("RED_DOT_ALERT", data);
    };
    const handleJobMarkComplete = (data: NotificationsResponse) => {
      setOpenComplete(true);
      console.log("JOB_MARKED_COMPLETE", data);
    };

    SocketsService.socket.on("connect", handleConnect);
    SocketsService.socket.on("disconnect", handleDisconnect);
    SocketsService.subscribe("RED_DOT_ALERT", handleRedDotAlert);
    SocketsService.subscribe("JOB_MARKED_COMPLETE", handleJobMarkComplete);

    if (notificationBagde) {
      setBadge(notificationBagde.data?.totalCount || 0);
    }

    return () => {
      SocketsService.socket.off("connect", handleConnect);
      SocketsService.socket.off("disconnect", handleDisconnect);
      SocketsService.unsubscribe("RED_DOT_ALERT");
      SocketsService.disconnect();
    };
  }, [notificationBagde]);

  return (
    <SocketContext.Provider
      value={{
        socket: SocketsService.socket,
        isConnected,
        badgeCount,
        handleReadNotifs,
        badge,
        setBadge,
        openComplete,
        setOpenComplete: (cm: boolean) => setOpenComplete(cm),
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within SocketProvider");
  }
  return context;
};
