import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Clock4 } from "lucide-react";
import { RequestLeaveButton } from "@/components/leave/request-leave-button";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

async function getMyLeaves() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return [];
  
  return prisma.leaveRequest.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' }
  });
}

export default async function EmployeeLeavesPage() {
  const leaves = await getMyLeaves();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Approved</Badge>;
      case "REJECTED":
        return <Badge variant="destructive" className="flex items-center gap-1"><XCircle className="w-3 h-3"/> Rejected</Badge>;
      default:
        return <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50 flex items-center gap-1"><Clock4 className="w-3 h-3"/> Pending</Badge>;
    }
  };

  return (
    <div className="flex flex-col gap-8 p-6 md:p-10 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Leaves</h1>
          <p className="text-muted-foreground mt-1">Manage your leave applications and view history.</p>
        </div>
        <RequestLeaveButton />
      </div>

      <Card className="shadow-sm border-border/50">
        <CardHeader>
          <CardTitle>Leave History</CardTitle>
          <CardDescription>A complete log of your past and upcoming leave requests.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Dates</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Duration</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Category</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Reason</th>
                  <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-right">Status</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {leaves.length === 0 && (
                   <tr>
                     <td colSpan={5} className="py-6 text-center text-muted-foreground">No leave history found.</td>
                   </tr>
                )}
                {leaves.map((leave) => (
                  <tr key={leave.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <td className="p-4 align-middle">
                      <div className="font-medium">{leave.startDate.toLocaleDateString()}</div>
                      {leave.startDate.getTime() !== leave.endDate.getTime() && (
                        <div className="text-xs text-muted-foreground">to {leave.endDate.toLocaleDateString()}</div>
                      )}
                    </td>
                    <td className="p-4 align-middle font-medium">{leave.duration}</td>
                    <td className="p-4 align-middle">
                      <span className="text-xs bg-secondary px-2 py-1 rounded-md text-muted-foreground">
                        {leave.category.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="p-4 align-middle text-muted-foreground max-w-[200px] truncate" title={leave.reason || "N/A"}>
                      {leave.reason || "No reason provided"}
                    </td>
                    <td className="p-4 align-middle text-right">
                      <div className="flex justify-end">{getStatusBadge(leave.status)}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
