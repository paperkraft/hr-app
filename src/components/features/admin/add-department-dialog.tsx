"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Plus } from "lucide-react"
import { createDepartment } from "@/actions/department"

export function AddDepartmentDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const name = formData.get("name") as string

    const res = await createDepartment(name)
    setLoading(false)

    if (res.success) {
      setOpen(false)
    } else {
      setError(res.error || "Failed to create department")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-9 px-4 bg-primary hover:bg-primary/90 text-[11px] font-bold uppercase tracking-widest rounded-sm shadow-sm transition-all">
          <Plus className="size-3.5 mr-1.5" /> Add Department
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-sm border-border/60 shadow-lg p-0 overflow-hidden max-w-sm">
        <DialogHeader className="px-5 py-4 border-b border-border/40">
          <DialogTitle className="text-sm font-bold tracking-tight">New Department</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="p-5 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground/50">Department Name</Label>
            <Input
              name="name"
              required
              placeholder="e.g. Civil Engineering"
              className="h-9 bg-muted/5 border-border/60 rounded-sm text-xs font-medium focus:ring-primary/10"
            />
          </div>
          {error && (
            <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">{error}</p>
          )}
          <div className="flex items-center gap-2 pt-1">
            <Button
              type="button"
              variant="ghost"
              className="flex-1 h-9 text-xs font-bold uppercase tracking-widest rounded-sm"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 h-9 bg-primary hover:bg-primary/90 text-[11px] font-bold uppercase tracking-widest rounded-sm shadow-sm"
            >
              {loading ? <Loader2 className="size-3.5 animate-spin" /> : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
