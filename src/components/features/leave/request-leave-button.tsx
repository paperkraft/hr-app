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
      <DialogContent className="sm:max-w-md">
        <DialogTitle className="sr-only">Apply for Leave</DialogTitle>
        <DialogHeader>
          <div className="flex items-center gap-2 pb-4 border-b border-border/50">
            <CalendarRange className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">Apply for Leave</h2>
          </div>
        </DialogHeader>
        <DialogDescription className="sr-only">Apply for Leave</DialogDescription>
        <LeaveApplicationForm onSuccess={() => setDialogOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
