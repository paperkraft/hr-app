"use client";

import { LogOut, User } from "lucide-react";
import { signOut } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function UserNav({ userName }: { userName: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex items-center gap-2 cursor-pointer hover:bg-muted p-1.5 pr-3 rounded-sm transition-colors duration-150 border border-transparent hover:border-border">
          <div className="w-7 h-7 rounded-sm bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
            {userName.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm font-medium hidden sm:block text-foreground">{userName}</span>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 animate-scale-in">
        <DropdownMenuLabel className="font-semibold">My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="transition-colors">
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="text-destructive focus:bg-destructive/10 focus:text-destructive transition-colors"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
