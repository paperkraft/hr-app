"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { LeaveApplicationForm } from "@/components/features/leave/leave-application-form";
import { CalendarRange } from "lucide-react";

export function RequestLeaveButton() {
  const [open, setDialogOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button className="h-10 px-5">Request Leave</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl p-0 border-none shadow-2xl overflow-hidden rounded-2xl">
        <div className="flex flex-col max-h-[96vh]">
          {/* Fixed Header */}
          <div className="px-6 py-5 border-b border-border/50 bg-background/50 backdrop-blur-sm shrink-0">
            <DialogTitle className="sr-only">Apply for Leave</DialogTitle>
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <CalendarRange className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight">Apply for Leave</h2>
                  <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Submit your request for administrative review</p>
                </div>
              </div>
            </DialogHeader>
            <DialogDescription className="sr-only">Fill in the details below to request time off.</DialogDescription>
          </div>

          {/* Scrollable Form Body */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 pt-4">
            <LeaveApplicationForm onSuccess={() => setDialogOpen(false)} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
