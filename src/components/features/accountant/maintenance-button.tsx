"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";
import { triggerMaintenance } from "@/actions/maintenance";
import { toast } from "sonner";

export function MaintenanceButton() {
  const [isPending, startTransition] = useTransition();

  const handleTrigger = () => {
    startTransition(async () => {
      const result = await triggerMaintenance();
      if (result.success) {
        toast.success("Maintenance Complete", {
          description: result.message,
        });
      } else if (result.error) {
        toast.error("Maintenance Failed", {
          description: result.error,
        });
      }
    });
  };

  return (
    <Button
      onClick={handleTrigger}
      disabled={isPending}
      variant="outline"
      className="bg-primary/5 hover:bg-primary/10 border-primary/20 text-primary font-bold shadow-sm"
    >
      {isPending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <RefreshCw className="mr-2 h-4 w-4" />
          Maintenance
        </>
      )}
    </Button>
  );
}
