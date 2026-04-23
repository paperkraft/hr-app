"use client";

import { useState } from "react";
import { LogOut, User as UserIcon, Loader2 } from "lucide-react";
import { signOut } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProfileDialog } from "@/components/features/profile/profile-dialog";
import { getUserProfile } from "@/actions/user";
import { toast } from "sonner";

export function UserNav({ userName }: { userName: string }) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleOpenProfile = async () => {
    setIsLoading(true);
    try {
      const result = await getUserProfile();
      if (result.success) {
        setUserData(result.data);
        setProfileOpen(true);
      } else {
        toast.error("Failed to load profile details");
      }
    } catch (error) {
      toast.error("An error occurred while loading profile");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="flex items-center gap-2 cursor-pointer hover:bg-muted p-1.5 pr-3 rounded-sm transition-colors duration-150 border border-transparent hover:border-border">
            <div className="w-7 h-7 rounded-sm bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
              {userName.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-medium hidden sm:block text-foreground">{userName}</span>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 animate-scale-in shadow-2xl border-border/60">
          <DropdownMenuLabel className="font-semibold">My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            className="transition-colors cursor-pointer"
            onClick={handleOpenProfile}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <UserIcon className="mr-2 h-4 w-4" />
            )}
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="text-destructive focus:bg-destructive/10 focus:text-destructive transition-colors cursor-pointer"
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {userData && (
        <ProfileDialog 
          user={userData} 
          open={profileOpen} 
          onOpenChange={setProfileOpen} 
        />
      )}
    </>
  );
}
