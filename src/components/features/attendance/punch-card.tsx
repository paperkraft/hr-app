'use client';
import { useState, useEffect, useTransition } from "react";
import { punchInOutAction } from "@/actions/attendance";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle2, Loader2, AlertCircle, LogIn, LogOut } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AttendanceCardProps {
  initialStatus: "PENDING" | "PUNCHED_IN" | "PUNCHED_OUT";
  autoPunchOutCount?: number;
  warningThreshold?: number;
}

export function AttendanceCard({ initialStatus, autoPunchOutCount = 0, warningThreshold = 3 }: AttendanceCardProps) {
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

  const handleCheck = () => {
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
        toast.success(`Session ${targetStatus === "PUNCHED_IN" ? "started" : "ended"} successfully`);
        window.location.reload(); 
      } else {
        toast.error("Process failed: " + result.error);
      }
    });
  };

  return (
    <div className="bg-white border border-border/60 rounded-sm overflow-hidden h-full flex flex-col animate-fade-in shadow-sm group">
      <div className="p-6 flex-1 flex flex-col items-center justify-center gap-6 relative overflow-hidden">
        {/* Subtle Decorative Element */}
        <div className="absolute -top-4 -right-4 opacity-[0.02] select-none pointer-events-none group-hover:rotate-12 transition-transform duration-700">
          <Clock className="size-32" />
        </div>

        <div className="flex flex-col items-center gap-1 mt-2">
          <div className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.2em]">
            Digital Time
          </div>
          <div className="text-5xl font-bold tabular-nums tracking-tighter text-foreground">
            {currentTime ? currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--:--"}
          </div>
        </div>

        {status === "PUNCHED_OUT" ? (
          <div className="flex flex-col items-center justify-center gap-3 animate-scale-in">
            <div className="flex items-center gap-2 text-emerald-600 bg-emerald-500/5 px-6 py-2.5 rounded-sm border border-emerald-500/10">
              <CheckCircle2 className="size-3.5" />
              <span className="font-black text-[10px] uppercase tracking-widest leading-none">Shift Finalized</span>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-[200px]">
            <Button
              size="lg"
              className={cn(
                "w-full h-12 text-[11px] font-bold uppercase tracking-widest rounded-sm transition-all duration-300 shadow-sm relative overflow-hidden border",
                status === "PUNCHED_IN"
                  ? "bg-white text-amber-600 border-amber-500/20 hover:bg-amber-500/5"
                  : "bg-primary text-primary-foreground border-transparent hover:bg-primary/95"
              )}
              disabled={isPending}
              onClick={handleCheck}
            >
              <div className="relative flex items-center justify-center gap-2.5">
                {isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : status === "PENDING" ? (
                  <>
                    <LogIn className="size-4" />
                    Check In
                  </>
                ) : (
                  <>
                    <LogOut className="size-4" />
                    Check Out
                  </>
                )}
              </div>
            </Button>
          </div>
        )}

        {status === "PUNCHED_IN" && !isPending && (
          <div className="animate-fade-in flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-emerald-500/5 border border-emerald-500/10">
            <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Active Session</span>
          </div>
        )}
        
        <div className="flex-1 min-h-[20px]" />

        {/* High-Density Warning */}
        {autoPunchOutCount >= warningThreshold && (
          <div className="w-full bg-rose-500/[0.02] border border-rose-500/10 rounded-sm p-3.5 flex gap-3 animate-fade-in">
            <AlertCircle className="size-4 text-rose-500 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest">System Warning</p>
              <p className="text-[10px] text-muted-foreground/60 leading-snug font-medium">
                Detected {autoPunchOutCount} auto-closures. Ensure manual check-out.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
