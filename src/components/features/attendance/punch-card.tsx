'use client';
import { useState, useEffect, useTransition } from "react";
import { punchInOutAction } from "@/actions/attendance";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle2, Loader2, AlertCircle, MapPin, Play, Square } from "lucide-react";
import { toast } from "sonner";
import { PageSection, StatusBadge, Divider } from "@/components/ui";
import { cn } from "@/lib/utils";

interface PunchCardProps {
  initialStatus: "PENDING" | "PUNCHED_IN" | "PUNCHED_OUT";
  autoPunchOutCount?: number;
  warningThreshold?: number;
}

export function PunchCard({ initialStatus, autoPunchOutCount = 0, warningThreshold = 3 }: PunchCardProps) {
  const [status, setStatus] = useState(initialStatus);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setStatus(initialStatus);
  }, [initialStatus]);

  useEffect(() => {
    setCurrentTime(new Date());
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const handlePunch = () => {
    const targetStatus = status === "PENDING" ? "PUNCHED_IN" : "PUNCHED_OUT";

    startTransition(async () => {
      let coords = undefined;

      try {
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
      }

      const result = await punchInOutAction(coords);
      if (result.success) {
        setStatus(targetStatus);
        toast.success(`Punched ${targetStatus === "PUNCHED_IN" ? "in" : "out"} successfully`);
      } else {
        console.error(result.error);
        toast.error("Failed to record punch: " + result.error);
      }
    });
  };

  return (
    <PageSection
      title="Daily Attendance"
      description="Track your daily shift entry and exit."
      className="h-full animate-fade-in flex flex-col"
      noPadding
    >
      <div className="flex-1 p-6 flex flex-col items-center justify-center gap-6 relative overflow-hidden">
        {/* Background Accent */}
        <div className="absolute top-0 right-0 p-4 opacity-5 select-none pointer-events-none">
          <Clock className="size-32 rotate-12" />
        </div>

        <div className="flex flex-col items-center gap-1">
          <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] mb-1">
            Current Server Time
          </div>
          <div className="text-5xl font-black tabular-nums tracking-tighter text-foreground drop-shadow-sm">
            {currentTime ? currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : "--:--"}
          </div>
        </div>

        {status === "PUNCHED_OUT" ? (
          <div className="flex flex-col items-center justify-center gap-3 mt-2 animate-scale-in">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-6 py-3 rounded-2xl border border-emerald-500/20 shadow-sm">
              <CheckCircle2 className="size-5" />
              SHIFT COMPLETED
            </div>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Great work today!</p>
          </div>
        ) : (
          <div className="w-full max-w-[240px] relative">
            <Button
              size="lg"
              className={cn(
                "w-full h-16 text-xs font-black uppercase tracking-[0.2em] rounded-2xl transition-all duration-500 shadow-xl active:scale-95 group overflow-hidden",
                status === "PUNCHED_IN"
                  ? "bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20"
                  : "bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/20"
              )}
              disabled={isPending}
              onClick={handlePunch}
            >
              <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <div className="relative flex items-center justify-center gap-3">
                {isPending ? (
                  <Loader2 className="size-5 animate-spin" />
                ) : status === "PENDING" ? (
                  <>
                    <Play className="size-4 fill-current" />
                    Punch In
                  </>
                ) : (
                  <>
                    <Square className="size-4 fill-current" />
                    Punch Out
                  </>
                )}
              </div>
            </Button>
          </div>
        )}

        {status === "PUNCHED_IN" && !isPending && (
          <div className="animate-fade-in">
            <StatusBadge
              status="success"
              label="Currently Clocked In"
              size="sm"
              withDot={true}
              animated
              className="font-black uppercase tracking-widest text-[9px] px-4"
            />
          </div>
        )}

        {/* Auto Punch-Out Warning */}
        {autoPunchOutCount >= warningThreshold && (
          <div className="w-full mt-4 bg-rose-500/5 border border-rose-500/10 rounded-2xl p-4 flex gap-3 animate-fade-in-up">
            <div className="p-2 rounded-xl bg-rose-500/10 shrink-0">
              <AlertCircle className="size-4 text-rose-500" />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Policy Warning</p>
              <p className="text-[10px] text-muted-foreground leading-relaxed font-medium">
                You have <span className="font-bold text-foreground underline">{autoPunchOutCount}</span> forgotten punch-outs.
                Please ensure you clock out daily to avoid penalties.
              </p>
            </div>
          </div>
        )}
      </div>
    </PageSection>
  );
}
