import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Inbox } from "lucide-react";

interface Request {
  id: string;
  dates: string;
  status: string;
  category: string;
  managerNote?: string | null;
}

interface RecentRequestsCardProps {
  requests: Request[];
}

export function RecentRequestsCard({ requests }: RecentRequestsCardProps) {
  return (
    <Card className="shadow-sm border-border/40 hover:shadow-md transition-shadow duration-200 flex flex-col overflow-hidden">
      <CardHeader className="pb-3 border-b border-border/40 bg-muted/5 p-4 shrink-0 flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" />
          <CardTitle className="text-base font-semibold">Leave Requests</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-1 overflow-auto">
        <div className="divide-y divide-border/40 h-full">
          {requests.length === 0 ? (
            <div className="py-8 flex flex-col items-center justify-center text-muted-foreground h-full">
              <Inbox className="w-8 h-8 mb-2 opacity-20" />
              <p className="text-xs">No pending requests.</p>
            </div>
          ) : (
            requests.map((req) => (
              <div key={req.id} className="flex items-center justify-between p-3.5 hover:bg-muted/30 transition-colors">
                <div className="flex flex-col gap-0.5">
                  <span className="font-semibold text-xs">{req.dates}</span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-tight">{req.category}</span>
                  {req.managerNote && (
                    <div className="mt-1 flex items-center gap-1.5 overflow-hidden">
                      <Badge variant="outline" className={`h-4 px-1 text-[8px] font-bold uppercase tracking-tighter shrink-0 ${
                        req.status === 'REJECTED' 
                          ? 'border-destructive/30 bg-destructive/5 text-destructive' 
                          : 'border-primary/20 bg-primary/5 text-primary'
                      }`}>
                        Note
                      </Badge>
                      <span className="text-[10px] text-muted-foreground italic truncate max-w-[150px]" title={req.managerNote}>
                        {req.managerNote}
                      </span>
                    </div>
                  )}
                </div>
                <Badge 
                  variant={req.status === "APPROVED" ? "outline" : req.status === "REJECTED" ? "destructive" : "outline"}
                  className={`text-[9px] h-5 font-bold px-1.5 ${
                    req.status === "APPROVED" 
                      ? "border-emerald-100 bg-emerald-50/50 text-emerald-600 dark:bg-emerald-500/10 dark:border-emerald-500/20" 
                      : req.status === "REJECTED"
                      ? ""
                      : "text-amber-600 border-amber-200 bg-amber-50"
                  }`}
                >
                  {req.status}
                </Badge>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
