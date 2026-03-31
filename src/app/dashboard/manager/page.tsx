import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Inbox, Check, Clock, MapPinOff } from "lucide-react";
import { LeaveApprovalRow } from "@/components/manager/leave-approval-row";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell
} from "@/components/ui/table";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getTodayRange } from "@/lib/attendance-helper";

export const dynamic = 'force-dynamic';

async function getTeamData() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { pendingRequests: [], teamStatus: [] };

  // 1. Get Pending Team Leaves
  const requests = await prisma.leaveRequest.findMany({
    where: {
      status: "PENDING",
      user: { managerId: session.user.id }
    },
    include: { user: true },
    orderBy: { createdAt: 'asc' }
  });

  const pendingRequests = requests.map((req: any) => ({
    id: req.id,
    employeeName: req.user.name || req.user.email,
    startDate: new Date(req.startDate).toISOString().split('T')[0],
    endDate: new Date(req.endDate).toISOString().split('T')[0],
    duration: req.duration,
    category: req.category,
    reason: req.reason || "No reason provided",
    startTime: req.startTime,
    endTime: req.endTime,
  }));

  // 2. Build Team Live Attendance Status
  const team = await prisma.user.findMany({
    where: { managerId: session.user.id },
    select: { id: true, name: true, email: true }
  });

  const { start, end } = getTodayRange();
  const todayLogs = await prisma.attendance.findMany({
    where: {
      userId: { in: team.map(t => t.id) },
      date: { gte: start, lte: end }
    }
  });

  const teamStatus = team.map(member => {
    const log = todayLogs.find(l => l.userId === member.id);
    let status = "PENDING";
    let inTime = null;

    if (log) {
      if (log.punchOut) status = "PUNCHED_OUT";
      else {
        status = "PUNCHED_IN";
        inTime = log.punchIn.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      }
    }

    return { 
      id: member.id, 
      name: member.name || member.email, 
      status, 
      inTime, 
      isOutsideOffice: log?.isOutsideOffice ?? false 
    };
  });

  return { pendingRequests, teamStatus };
}

export default async function ManagerDashboard() {
  const { pendingRequests, teamStatus } = await getTeamData();
  const activeNow = teamStatus.filter(t => t.status === "PUNCHED_IN").length;

  return (
    <div className="flex flex-col gap-8 p-6 md:p-8 lg:p-10 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Team Management</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">Review live team attendance and process leave requests.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-sm border-border/40 bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              Total Team Size
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{teamStatus.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Direct reports under you</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/40 bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-500" />
              Currently Active
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">{activeNow}</div>
            <p className="text-xs text-muted-foreground mt-1">Punched in right now</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/40 bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Inbox className="w-4 h-4 text-amber-500" />
              Action Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">{pendingRequests.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Pending leaves to review</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Pending Leave Requests Table */}
          <Card className="shadow-sm border-border/40 h-full p-0 gap-0">
            <CardHeader className="border-b border-border/40 bg-muted/10 p-4">
              <CardTitle className="text-lg">Leave Approvals</CardTitle>
              <CardDescription>Review and manage leave applications from your team.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {pendingRequests.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                  <Check className="w-12 h-12 mb-4 text-emerald-500/50" />
                  <p className="text-sm font-medium text-foreground">You're all caught up!</p>
                  <p className="text-xs">No pending leave requests to review.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow className="[&>th]:px-4">
                      <TableHead>Employee</TableHead>
                      <TableHead>Dates & Policy</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingRequests.map((req: any) => (
                      <LeaveApprovalRow key={req.id} request={req} />
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          {/* Team Today's Status Widget */}
          <Card className="shadow-sm border-border/40 p-0 gap-0">
            <CardHeader className="border-b border-border/40 bg-muted/10 p-4">
              <CardTitle className="text-lg">Today's Team Status</CardTitle>
              <CardDescription>Live attendance overview.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/40">
                {teamStatus.length === 0 ? (
                  <p className="p-6 text-center text-sm text-muted-foreground">No team members assigned.</p>
                ) : (
                  teamStatus.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-4 hover:bg-muted/10 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                          {member.name.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="font-medium text-sm">{member.name}</span>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {member.status === "PUNCHED_IN" && (
                          <Badge variant="outline" className="text-emerald-600 bg-emerald-50 border-emerald-200">
                            Working
                          </Badge>
                        )}
                        {member.status === "PUNCHED_OUT" && (
                          <Badge variant="outline" className="text-muted-foreground bg-muted/50">
                            Shift Ended
                          </Badge>
                        )}
                        {member.status === "PENDING" && (
                          <Badge variant="outline" className="text-amber-600 bg-amber-50 border-amber-200">
                            Not Clocked In
                          </Badge>
                        )}
                        {member.isOutsideOffice && (
                          <div className="flex items-center gap-1 text-[10px] text-rose-500 font-bold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100 italic">
                            <MapPinOff className="size-2.5" />
                            Off-site
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}