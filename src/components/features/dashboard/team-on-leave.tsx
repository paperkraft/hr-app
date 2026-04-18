import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CalendarDays, Users } from "lucide-react";
import { PageSection } from "@/components/ui";

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
    <PageSection
      title="Team Visibility"
      description="Who is currently or soon to be out"
      className="h-full animate-fade-in shadow-xl border-border/40"
      noPadding
    >
      <div className="flex flex-col h-full bg-gradient-to-br from-background to-muted/20">
        <div className="divide-y divide-border/40 flex-1">
          {members.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground italic text-xs flex flex-col items-center justify-center gap-3 opacity-60">
               <Users className="size-6 opacity-20" />
               <p className="font-bold">No team members are out today.</p>
            </div>
          ) : (
            members.map((member) => (
              <div key={member.id} className="p-4 flex items-center justify-between hover:bg-muted/10 transition-colors group">
                <div className="flex items-center gap-3">
                  <Avatar className="size-10 border border-border/40 shadow-sm transition-transform group-hover:scale-105">
                    <AvatarFallback className="bg-primary/5 text-primary text-[10px] font-black uppercase">
                      {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                     <span className="text-sm font-bold text-foreground leading-none mb-1">{member.name}</span>
                     <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{member.role || "Team Member"}</span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] font-black text-primary bg-primary/5 border border-primary/10 px-2 py-0.5 rounded uppercase tracking-tighter">
                      {member.leaveType}
                    </span>
                    <span className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest">
                      UNTIL {new Date(member.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </PageSection>
  );
}

