import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, FileText, Activity, ShieldAlert, CheckCircle2, Check } from "lucide-react";
import prisma from "@/lib/prisma";
import { LeaveApprovalRow } from "@/components/manager/leave-approval-row";

export const dynamic = 'force-dynamic';

async function getAdminStats() {
  const totalEmployees = await prisma.user.count();

  // Fetch ALL pending requests across the entire system
  const allPendingRequests = await prisma.leaveRequest.findMany({
    where: {
      status: "PENDING"
    },
    include: { user: true },
    orderBy: { createdAt: "asc" }
  });

  return {
    totalEmployees,
    pendingLeavesSystemWide: allPendingRequests.length,
    attendanceRate: "100%", // Scaffold
    allPendingRequests: allPendingRequests.map((req: any) => ({
      id: req.id,
      employeeName: `${req.user.name || req.user.email} (${req.user.role})`, // Show role next to name
      startDate: new Date(req.startDate).toISOString().split('T')[0],
      endDate: new Date(req.endDate).toISOString().split('T')[0],
      duration: req.duration,
      category: req.category,
      reason: req.reason || "No reason provided",
    })),
    recentActivity: [
      { id: 1, action: "Database Seed Verified", details: "All initial users are loaded", time: "Just now", type: "system" },
      { id: 2, action: "Leave Policy Update", details: "Policy 2 cycle renewed", time: "1 day ago", type: "policy" },
      { id: 3, action: "System Alert", details: "No fractional balances found", time: "2 days ago", type: "alert" },
    ]
  };
}

export default async function AdminOverviewPage() {
  const stats = await getAdminStats();

  return (
    <div className="flex flex-col gap-8 p-6 md:p-10 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Overview</h1>
        <p className="text-muted-foreground mt-1">High-level administration and system metrics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-sm border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="w-4 h-4" />
              Total Employees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalEmployees}</div>
            <p className="text-xs text-muted-foreground mt-1">Active across all departments</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Pending Leaves
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">{stats.pendingLeavesSystemWide}</div>
            <p className="text-xs text-muted-foreground mt-1">System-wide awaiting approval</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Today's Attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">{stats.attendanceRate}</div>
            <p className="text-xs text-muted-foreground mt-1">Punched in on time</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* All Leave Requests (Spans 2 columns on extra large screens) */}
        <Card className="shadow-sm border-border/50 xl:col-span-2">
          <CardHeader>
            <CardTitle>All Pending Leave Requests</CardTitle>
            <CardDescription>Leaves requiring approval across the entire organization.</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.allPendingRequests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Check className="w-12 h-12 mb-4 text-border" />
                <p>No pending requests in the system.</p>
              </div>
            ) : (
              <div className="relative w-full overflow-auto">
                <table className="w-full caption-bottom text-sm">
                  <thead className="[&_tr]:border-b">
                    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Employee</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Dates</th>
                      <th className="h-12 align-middle font-medium text-muted-foreground text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="[&_tr:last-child]:border-0">
                    {stats.allPendingRequests.map((req: any) => (
                      <LeaveApprovalRow key={req.id} request={req} />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/50 xl:col-span-1">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>System log of important HR events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {stats.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-4">
                  <div className={`p-2 rounded-full mt-1 ${activity.type === 'alert' ? 'bg-amber-100 text-amber-600' :
                    activity.type === 'policy' ? 'bg-blue-100 text-blue-600' :
                      'bg-secondary text-foreground'
                    }`}>
                    {activity.type === 'alert' ? <ShieldAlert className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">{activity.action}</p>
                    <p className="text-sm text-muted-foreground">{activity.details}</p>
                  </div>
                  <div className="text-xs text-muted-foreground">{activity.time}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}