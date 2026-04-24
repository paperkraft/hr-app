'use client';
import { useState, useEffect, useTransition } from "react";
import { punchInOutAction } from "@/actions/attendance";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle2, Loader2, AlertCircle, LogIn, LogOut } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AttendanceCardProps {
  initialStatus: "PENDING" | "PUNCHED_IN" | "PUNCHED_OUT";
  punchInTime?: Date | string | null;
  autoPunchOutCount?: number;
  warningThreshold?: number;
}

export function AttendanceCard({ initialStatus, punchInTime, autoPunchOutCount = 0, warningThreshold = 3 }: AttendanceCardProps) {
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
        if (!navigator.geolocation) {
          toast.error("Geolocation is not supported by your browser.");
          return;
        }

        toast.info("Refining location accuracy...", {
          description: "Acquiring a high-precision GPS lock. This may take a few seconds.",
          duration: 4000
        });

        // Helper to get location with multiple attempts for better accuracy
        const getHighAccuracyPos = async (maxAttempts = 3): Promise<GeolocationPosition> => {
          let lastResult: GeolocationPosition | null = null;

          for (let i = 0; i < maxAttempts; i++) {
            try {
              const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                  enableHighAccuracy: true,
                  timeout: 10000,
                  maximumAge: 0
                });
              });

              lastResult = pos;
              // If accuracy is better than 80 meters, it's likely a solid native GPS/Wi-Fi lock
              if (pos.coords.accuracy <= 80) return pos;

              // If not precise enough, wait a bit for hardware to warm up and try again
              await new Promise(r => setTimeout(r, 1000));
            } catch (err) {
              if (i === maxAttempts - 1 && !lastResult) throw err;
            }
          }
          return lastResult!; // Return the best we got if we didn't hit threshold
        };

        const position = await getHighAccuracyPos();

        // Log accuracy for monitoring
        console.log(`[GEO] Captured location with accuracy: ${position.coords.accuracy}m`);

        coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
      } catch (err: any) {
        let errorMsg = "Please enable location services to continue.";

        if (err.code === 1) { // PERMISSION_DENIED
          errorMsg = "Location access denied. Please enable it in browser settings.";
        } else if (err.code === 3) { // TIMEOUT
          errorMsg = "Location request timed out. Please ensure GPS is active and try again.";
        }

        toast.error(errorMsg, {
          description: "Required for attendance verification.",
          duration: 5000
        });
        return;
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
    <div className="bg-card border border-border rounded-sm overflow-hidden h-full flex flex-col animate-fade-in group">
      <div className="p-6 flex-1 flex flex-col items-center justify-center gap-6 relative overflow-hidden">
        {/* Subtle Decorative Element */}
        <div className="absolute -top-4 -right-4 opacity-[0.02] select-none pointer-events-none group-hover:rotate-12 transition-transform duration-700">
          <Clock className="size-32" />
        </div>

        <div className="flex flex-col items-center gap-1 mt-2">
          <div className="text-[10px] font-black text-muted-foreground/80 uppercase tracking-[0.2em]">
            Digital Time
          </div>
          <div className="text-5xl text-[#444] font-bold tabular-nums tracking-tighter">
            {currentTime ? (
              <span className="flex items-baseline gap-1">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
              </span>
            ) : "--:--"}
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 w-full max-w-[240px] px-4">
          {status === "PUNCHED_OUT" ? (
            <div className="flex flex-col items-center justify-center gap-3 animate-scale-in w-full">
              <div className="flex items-center gap-2 text-emerald-600 bg-emerald-500/5 px-6 py-3 rounded-sm border border-emerald-500/10 w-full justify-center">
                <CheckCircle2 className="size-4" />
                <span className="font-black text-[10px] uppercase tracking-widest leading-none">Shift Finalized</span>
              </div>
            </div>
          ) : (
            <Button
              size="lg"
              className={cn(
                "w-full h-12 text-[11px] font-bold uppercase tracking-widest rounded-sm transition-all duration-300 relative overflow-hidden border shadow-sm",
                status === "PUNCHED_IN"
                  ? "bg-amber-600 text-white border-amber-700 hover:bg-amber-700 hover:shadow-md"
                  : "bg-primary text-primary-foreground border-transparent hover:bg-primary/95 hover:shadow-md"
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
          )}

          {status === "PUNCHED_IN" && !isPending && (
            <div className="flex flex-col items-center gap-2 animate-fade-in">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-sm bg-emerald-500/10 border border-emerald-500/20">
                <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] font-black text-emerald-700 uppercase tracking-widest">Active Session</span>
              </div>
              {punchInTime && (
                <div className="text-[10px] font-bold text-muted-foreground/60 flex items-center gap-1">
                  <Clock className="size-3 text-muted-foreground/40" />
                  <span>
                    Started at {new Date(punchInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>



        {/* High-Density Warning */}
        {autoPunchOutCount >= warningThreshold && (
          <div className="w-full bg-rose-500/2 border border-rose-500/10 rounded-sm p-3.5 flex gap-3 animate-fade-in">
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
