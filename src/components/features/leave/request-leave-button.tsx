"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { LeaveApplicationForm } from "@/components/features/leave/leave-application-form";
import { CalendarRange, X } from "lucide-react";

export function RequestLeaveButton() {
  const [open, setDialogOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button className="h-9 px-4 bg-primary hover:bg-primary/90 text-[11px] font-bold uppercase tracking-widest rounded-sm shadow-sm transition-all">
          <CalendarRange className="size-3.5 mr-1.5" /> Request Leave
        </Button>
      </DialogTrigger>
      <DialogContent className="p-0 rounded-sm border-border/60 shadow-lg overflow-hidden sm:max-w-xl group">
        <div className="flex flex-col max-h-[96vh]">
          {/* Header */}
          <div className="px-5 py-4 border-b border-border/40 bg-muted/5 shrink-0">
            <DialogTitle className="sr-only">Apply for Leave</DialogTitle>
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="size-7 rounded-sm bg-primary/5 text-primary flex items-center justify-center border border-primary/10">
                  <CalendarRange className="size-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold tracking-tight">Apply for Leave</h2>
                  <p className="text-[10px] text-muted-foreground/40 font-black uppercase tracking-widest mt-0.5">Submit request for administrative review</p>
                </div>
              </div>
            </DialogHeader>
            <DialogDescription className="sr-only">Fill in the details below to request time off.</DialogDescription>
          </div>

          {/* Form Body */}
          <div className="flex-1 overflow-y-auto p-5">
            <LeaveApplicationForm onSuccess={() => setDialogOpen(false)} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
