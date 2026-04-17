"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import { AllowanceRequestForm } from "./allowance-request-form";
import { useState } from "react";

export function AllowanceRequestDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-10 flex items-center gap-2 border-primary/20 hover:bg-primary/5 hover:text-primary transition-all">
          <MapPin className="size-4" />
          Allowance Request
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Business Meet Allowance</DialogTitle>
          <DialogDescription>
            Apply for allowance if you are attending a business meeting outside the office.
          </DialogDescription>
        </DialogHeader>
        <AllowanceRequestForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
