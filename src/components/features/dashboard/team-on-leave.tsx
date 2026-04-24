import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CalendarDays, Users } from "lucide-react";

interface TeamMember {
  id: string;
  name: string;
  role: string | null;
  startDate: Date;
  endDate: Date;
  leaveType: string;
  duration?: string;
  halfDayType?: string | null;
}

interface TeamOnLeaveProps {
  members: TeamMember[];
}

export function TeamOnLeave({ members }: TeamOnLeaveProps) {
  return (
    <div className="bg-card border border-border rounded-sm p-5 flex flex-col h-[430px] animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-foreground tracking-tight leading-none mb-1">Team Visibility</h3>
          <p className="text-[10px] text-muted-foreground/80 font-black uppercase tracking-widest">Availability Network</p>
        </div>
        <Users className="size-4 text-muted-foreground/80" />
      </div>

      <div className="space-y-1.5 flex-1 mt-5 overflow-y-auto scrollbar-hide">
        {members.length === 0 ? (
          <div className="py-8 text-center flex flex-col items-center gap-2 opacity-20">
            <CalendarDays className="size-6" />
            <p className="text-[10px] font-black uppercase tracking-widest">Team is fully active</p>
          </div>
        ) : (
          members.map((member) => (
            <div key={member.id} className="p-3 flex items-center justify-between hover:bg-muted/5 transition-all duration-200 rounded-sm border border-transparent hover:border-border/40 group">
              <div className="flex items-center gap-3">
                <Avatar className="size-8 rounded-sm border border-border/40">
                  <AvatarFallback className="bg-muted text-muted-foreground text-[9px] font-black uppercase rounded-sm">
                    {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-[12px] font-bold text-foreground leading-none mb-0.5">{member.name}</span>
                  <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-tight">{member.role || "Team Member"}</span>
                </div>
              </div>

              <div className="flex flex-col items-end">
                <div className="flex items-center gap-1.5">
                  {member.duration === "HALF" && member.halfDayType && (
                    <span className="text-[7px] font-black bg-amber-500/10 text-amber-600 px-1 rounded-[2px] border border-amber-500/10">
                      {member.halfDayType === "FIRST_HALF" ? "1H" : "2H"}
                    </span>
                  )}
                </div>
                <span className="text-[8px] font-bold text-muted-foreground/40 uppercase tracking-tighter">
                  {new Date(member.startDate).toDateString() === new Date(member.endDate).toDateString() ? (
                    new Date(member.startDate).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })
                  ) : (
                    `${new Date(member.startDate).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })} - ${new Date(member.endDate).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })}`
                  )}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

