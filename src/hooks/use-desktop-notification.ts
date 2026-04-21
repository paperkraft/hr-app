import { useCallback, useEffect, useState } from "react";

export function useDesktopNotification() {
  const [permission, setPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (!("Notification" in window)) return;
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      try {
        // Modern browsers (Promise-based)
        const result = await Notification.requestPermission();
        setPermission(result);
        return result;
      } catch (e) {
        // Fallback for older browsers (Callback-based)
        return new Promise<NotificationPermission>((resolve) => {
          Notification.requestPermission((result) => {
            setPermission(result);
            resolve(result);
          });
        });
      }
    }
    return "denied";
  }, []);

  const sendNotification = useCallback(
    (title: string, options?: NotificationOptions & { onClick?: () => void }) => {
      if (
        typeof window !== "undefined" &&
        "Notification" in window &&
        Notification.permission === "granted"
      ) {
        const notification = new Notification(title, {
          icon: "/favicon.ico",
          ...options,
        });

        if (options?.onClick) {
          notification.onclick = (e) => {
            e.preventDefault();
            window.focus();
            options.onClick!();
            notification.close();
          };
        }

        return notification;
      }
    },
    []
  );

  return { permission, requestPermission, sendNotification };
}
