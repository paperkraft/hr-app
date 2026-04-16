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
import { PlusCircle } from "lucide-react";
import { AccountantAllowanceForm } from "./accountant-allowance-form";
import { useState } from "react";

export function AllowanceDialog({ users }: { users: any[] }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2 border-primary/20 hover:bg-primary/5 hover:text-primary transition-all">
          <PlusCircle className="size-4" />
          Add Allowance
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Assign Allowance</DialogTitle>
          <DialogDescription>
            Assign a business meet allowance to an employee.
          </DialogDescription>
        </DialogHeader>
        <AccountantAllowanceForm users={users} onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
