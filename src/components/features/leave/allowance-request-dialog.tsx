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
        <Button className="h-9 px-4 bg-primary hover:bg-primary/90 text-[11px] font-bold uppercase tracking-widest rounded-sm shadow-sm transition-all">
          <MapPin className="size-3.5 mr-1.5" /> Allowance Request
        </Button>
      </DialogTrigger>
      <DialogContent className="p-0 rounded-sm border-border/60 shadow-lg overflow-hidden sm:max-w-xl group">
        <div className="flex flex-col max-h-[96vh]">
          {/* Header */}
          <div className="px-5 py-4 border-b border-border/40 bg-muted/5 shrink-0">
            <DialogTitle className="sr-only">Business Meet Allowance</DialogTitle>
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="size-7 rounded-sm bg-primary/5 text-primary flex items-center justify-center border border-primary/10">
                  <MapPin className="size-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold tracking-tight">Business Meet Allowance</h2>
                  <p className="text-[10px] text-muted-foreground/40 font-black uppercase tracking-widest mt-0.5">Request allowance for off-site meetings</p>
                </div>
              </div>
            </DialogHeader>
            <DialogDescription className="sr-only">
              Apply for allowance if you are attending a business meeting outside the office.
            </DialogDescription>
          </div>

          {/* Form Body */}
          <div className="flex-1 overflow-y-auto p-5">
            <AllowanceRequestForm onSuccess={() => setOpen(false)} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

}
