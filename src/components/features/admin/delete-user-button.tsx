"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Trash2, Loader2, MoreHorizontal } from "lucide-react"
import { deleteUser } from "@/actions/user"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function DeleteUserButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          className="text-destructive focus:bg-destructive focus:text-destructive-foreground cursor-pointer"
          disabled={loading}
          onClick={async () => {
             setLoading(true)
             await deleteUser(id)
             setLoading(false)
          }}
        >
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
          Delete User
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
