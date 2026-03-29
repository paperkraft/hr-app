"use client";

import { useState, useEffect, useTransition } from "react";
import { punchInOutAction } from "@/app/actions/attendance";
// Assuming you have these shadcn components installed:
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle2 } from "lucide-react";

export function PunchCard({ initialStatus }: { initialStatus: "PENDING" | "PUNCHED_IN" | "PUNCHED_OUT" }) {
  const [status, setStatus] = useState(initialStatus);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  // Sync state with props when switching menus or revalidating
  useEffect(() => {
    setStatus(initialStatus);
  }, [initialStatus]);

  // Client-side clock
  useEffect(() => {
    setCurrentTime(new Date());
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const [isPending, startTransition] = useTransition();

  const handlePunch = () => {
    // Optimistic update
    const nextStatus = status === "PENDING" ? "PUNCHED_IN" : "PUNCHED_OUT";
    setStatus(nextStatus);

    startTransition(async () => {
      const result = await punchInOutAction();
      if (!result.success) {
        // Rollback on error
        setStatus(initialStatus);
        console.error(result.error);
        alert(result.error);
      }
    });
  };

  return (
    <Card className="col-span-1 shadow-sm border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Clock className="w-5 h-5 text-muted-foreground" />
          Today's Attendance
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center py-6 gap-4">
        <div className="text-4xl font-bold tabular-nums tracking-tight">
          {currentTime ? currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--:--"}
        </div>
        
        {status === "PUNCHED_OUT" ? (
          <div className="flex items-center gap-2 text-emerald-600 font-medium bg-emerald-50 px-4 py-2 rounded-full">
            <CheckCircle2 className="w-5 h-5" />
            Shift Completed
          </div>
        ) : (
          <Button 
            size="lg" 
            className={`w-full max-w-50 text-lg rounded-full transition-all ${
              status === "PUNCHED_IN" ? "bg-amber-500 hover:bg-amber-600 text-white" : ""
            }`}
            disabled={isPending}
            onClick={handlePunch}
          >
            {status === "PENDING" ? "Punch In" : "Punch Out"}
          </Button>
        )}
        
        {status === "PUNCHED_IN" && (
          <p className="text-sm text-muted-foreground mt-2">
            You are currently clocked in.
          </p>
        )}
      </CardContent>
    </Card>
  );
}