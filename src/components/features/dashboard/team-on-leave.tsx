import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CalendarDays } from "lucide-react";

interface TeamMember {
  id: string;
  name: string;
  role: string | null;
  startDate: Date;
  endDate: Date;
  leaveType: string;
}

interface TeamOnLeaveProps {
  members: TeamMember[];
}

export function TeamOnLeave({ members }: TeamOnLeaveProps) {
  return (
    <Card className="shadow-sm border-border/40 h-full overflow-hidden">
      <CardHeader className="pb-3 border-b border-border/40 p-4">
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <CalendarDays className="size-4 text-primary" />
          Team Members on Leave
        </CardTitle>
        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest mt-0.5">
          Currently or soon to be out
        </p>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border/40">
          {members.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground italic text-xs">
              No team members are out today.
            </div>
          ) : (
            members.map((member) => (
              <div key={member.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-3">
                  <Avatar className="size-9 border border-border/60">
                    <AvatarFallback className="bg-primary/5 text-primary text-[10px] font-bold">
                      {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-bold leading-none">{member.name}</span>
                </div>

                <span className="text-[10px] font-mono font-bold text-foreground bg-muted px-1.5 py-0.5 rounded">
                  {new Date(member.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(member.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
