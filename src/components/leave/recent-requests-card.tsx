import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Request {
  id: string;
  dates: string;
  status: string;
  category: string;
}

interface RecentRequestsCardProps {
  requests: Request[];
}

export function RecentRequestsCard({ requests }: RecentRequestsCardProps) {
  return (
    <Card className="shadow-sm border-border/50">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Leave Requests</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="divide-y">
          {requests.length === 0 ? (
            <p className="py-4 text-center text-muted-foreground text-sm">No leave requests yet.</p>
          ) : (
            requests.map((req) => (
              <div key={req.id} className="flex items-center justify-between py-3">
                <div className="flex flex-col">
                  <span className="font-medium">{req.dates}</span>
                  <span className="text-sm text-muted-foreground">{req.category}</span>
                </div>
                <Badge 
                  variant={req.status === "APPROVED" ? "secondary" : req.status === "REJECTED" ? "destructive" : "outline"}
                  className={req.status === "APPROVED" ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-none" : ""}
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
