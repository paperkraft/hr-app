"use client";

import { useState, useEffect, useTransition } from "react";
import { punchInOutAction } from "@/app/actions/attendance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle2, Loader2 } from "lucide-react";

export function PunchCard({ initialStatus }: { initialStatus: "PENDING" | "PUNCHED_IN" | "PUNCHED_OUT" }) {
  const [status, setStatus] = useState(initialStatus);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [isPending, startTransition] = useTransition();

  // Keep state perfectly in sync with the server prop
  useEffect(() => {
    setStatus(initialStatus);
  }, [initialStatus]);

  useEffect(() => {
    setCurrentTime(new Date());
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const handlePunch = () => {
    // Determine target state
    const targetStatus = status === "PENDING" ? "PUNCHED_IN" : "PUNCHED_OUT";
    
    startTransition(async () => {
      let coords = undefined;
      
      try {
        // Request location
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
          });
        });
        
        coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
      } catch (err) {
        console.warn("Location access denied or unavailable:", err);
        // We continue anyway as per "Flag only, don't block" policy
      }

      const result = await punchInOutAction(coords);
      if (result.success) {
        setStatus(targetStatus);
      } else {
        console.error(result.error);
        alert("Failed to record punch: " + result.error);
      }
    });
  };

  return (
    <Card className="h-full shadow-sm border-border/40 flex flex-col p-0">
      <CardHeader className="pb-2 border-b border-border/40 bg-muted/10 p-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          Today's Attendance
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col items-center justify-center gap-5 p-4">
        <div className="text-4xl font-bold tabular-nums tracking-tighter text-foreground">
          {currentTime ? currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--:--"}
        </div>

        {status === "PUNCHED_OUT" ? (
          <div className="flex flex-col items-center justify-center gap-2 mt-2">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-500/10 px-5 py-2.5 rounded-full border border-emerald-200 dark:border-emerald-500/20">
              <CheckCircle2 className="w-5 h-5" />
              Shift Completed
            </div>
            <p className="text-xs text-muted-foreground">Great work today!</p>
          </div>
        ) : (
          <Button
            size="lg"
            className={`w-full max-w-55 h-12 text-lg rounded-full font-semibold transition-all duration-300 shadow-md ${status === "PUNCHED_IN"
              ? "bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20"
              : "bg-primary hover:bg-primary/90 shadow-primary/20"
              }`}
            disabled={isPending}
            onClick={handlePunch}
          >
            {isPending ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : status === "PENDING" ? (
              "Punch In"
            ) : (
              "Punch Out"
            )}
          </Button>
        )}

        {status === "PUNCHED_IN" && !isPending && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1 bg-secondary/50 px-3 py-1 rounded-full">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            You are clocked in
          </div>
        )}
      </CardContent>
    </Card>
  );
}