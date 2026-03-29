"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { LeaveApplicationForm } from "@/components/leave/leave-application-form";

export function RequestLeaveButton() {
  const [open, setDialogOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button>Request Leave</Button>
      </DialogTrigger>
      <DialogContent>
        <LeaveApplicationForm onSuccess={() => setDialogOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
