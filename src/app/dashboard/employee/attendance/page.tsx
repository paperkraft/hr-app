import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Clock, Calendar, CheckCircle2, AlertCircle, LogOut, Coffee, Download, Filter, Search, ArrowLeft, MoreHorizontal } from "lucide-react";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export const dynamic = 'force-dynamic';

async function getAttendanceLogs() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return [];

  return prisma.attendance.findMany({
    where: { userId: session.user.id },
    orderBy: { date: 'desc' },
  });
}

export default async function EmployeeAttendanceHistory() {
  const logs = await getAttendanceLogs();

  const totalDays = logs.length;
  const lateCount = logs.filter(l => l.isLate).length;
  const autoOutCount = logs.filter(l => l.isAutoPunchOut).length;
  const onTimeCount = totalDays - lateCount;

  return (
    <div className="flex flex-col gap-8 p-6 md:p-8 lg:p-10 max-w-7xl mx-auto animate-in fade-in duration-500">
      
      {/* breadcrumbs-like navigation and Header */}
      <div className="flex flex-col gap-4">
        <Link 
          href="/dashboard/employee" 
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Attendance History</h1>
            <p className="text-muted-foreground">A comprehensive record of your work shifts and punctuality.</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Button variant="outline" className="h-10 border-border/60 hover:bg-muted/50">
               <Download className="w-4 h-4 mr-2" />
               Export Logs
            </Button>
            <Button className="h-10 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm">
               Request Correction
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm border-border/40 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 bg-primary/5 rounded-full blur-2xl" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Records</CardTitle>
            <Calendar className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDays}</div>
            <p className="text-xs text-muted-foreground mt-1">Logged shifts since start</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/40 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 bg-emerald-500/5 rounded-full blur-2xl" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Punctuality</CardTitle>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{onTimeCount}</div>
            <p className="text-xs text-muted-foreground mt-1">On-time arrivals</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/40 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 bg-rose-500/5 rounded-full blur-2xl" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Late Marks</CardTitle>
            <AlertCircle className="w-4 h-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600">{lateCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Delayed check-ins</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/40 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 bg-amber-500/5 rounded-full blur-2xl" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Auto-Punch Outs</CardTitle>
            <LogOut className="w-4 h-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{autoOutCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Forgotten check-outs</p>
          </CardContent>
        </Card>
      </div>

      {/* Table Section */}
      <Card className="shadow-md border-border/40 overflow-hidden">
        <CardHeader className="pb-4 bg-muted/10 border-b border-border/40">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-bold">Historical Log</CardTitle>
              <CardDescription>View and manage all your attendance data</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative group w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input 
                   placeholder="Search by date..." 
                   className="pl-9 h-10 border-border/60 focus:border-primary transition-all text-sm rounded-lg" 
                />
              </div>
              <Button variant="outline" size="icon" className="h-10 w-10 shrink-0 border-border/60">
                 <Filter className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 border-b border-border/40">
                  <TableHead className="w-[180px] font-semibold py-4 px-6 text-foreground">Date</TableHead>
                  <TableHead className="font-semibold py-4 px-6 text-foreground">Punch In</TableHead>
                  <TableHead className="font-semibold py-4 px-6 text-foreground">Punch Out</TableHead>
                  <TableHead className="font-semibold py-4 px-6 text-foreground">Status</TableHead>
                  <TableHead className="font-semibold py-4 px-6 text-foreground">Shift Quality</TableHead>
                  <TableHead className="text-right font-semibold py-4 px-6 text-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-64 text-center">
                      <div className="flex flex-col items-center gap-3 text-muted-foreground">
                        <Coffee className="w-12 h-12 opacity-20" />
                        <p className="text-lg font-medium">No activity recorded yet</p>
                        <p className="text-sm max-w-xs mx-auto">Once you check in, your attendance records will appear here.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow key={log.id} className="hover:bg-muted/20 transition-colors group border-b border-border/10">
                      <TableCell className="py-4 px-6">
                         <div className="flex flex-col">
                            <span className="font-semibold text-foreground">
                               {new Date(log.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                            <span className="text-xs text-muted-foreground">
                               {new Date(log.date).toLocaleDateString('en-US', { weekday: 'long' })}
                            </span>
                         </div>
                      </TableCell>
                      <TableCell className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-full bg-emerald-500/10">
                            <Clock className="w-3.5 h-3.5 text-emerald-600" />
                          </div>
                          <span className="font-mono text-sm font-medium">
                            {new Date(log.punchIn).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-6">
                         {log.punchOut ? (
                           <div className="flex items-center gap-2">
                             <div className="p-1.5 rounded-full bg-slate-500/10">
                               <Clock className="w-3.5 h-3.5 text-slate-600" />
                             </div>
                             <span className="font-mono text-sm font-medium">
                               {new Date(log.punchOut).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                             </span>
                           </div>
                         ) : (
                           <Badge variant="secondary" className="bg-primary/10 text-primary border-none text-[10px] font-bold py-0.5 px-2">
                             IN PROGRESS
                           </Badge>
                         )}
                      </TableCell>
                      <TableCell className="py-4 px-6">
                         {log.isAutoPunchOut ? (
                           <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900/40">
                             <AlertCircle className="w-3 h-3 mr-1" /> Auto-Out
                           </Badge>
                         ) : log.isLateSpecialCase ? (
                           <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-900/40">
                             <CheckCircle2 className="w-3 h-3 mr-1" /> Covered
                           </Badge>
                         ) : log.isLate ? (
                           <Badge variant="outline" className="text-destructive border-destructive/20 bg-destructive/5">
                             <AlertCircle className="w-3 h-3 mr-1" /> Late
                           </Badge>
                         ) : (
                           <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20 dark:border-emerald-900/40">
                             <CheckCircle2 className="w-3 h-3 mr-1" /> On Time
                           </Badge>
                         )}
                      </TableCell>
                      <TableCell className="py-4 px-6">
                        <div className="flex flex-col gap-1">
                           <div className="flex items-center gap-1.5">
                              <div className={`w-2 h-2 rounded-full ${log.isOutsideOffice ? 'bg-destructive' : 'bg-emerald-500'}`} />
                              <span className="text-xs font-medium uppercase tracking-tight">
                                {log.isOutsideOffice ? 'Off-Site Entry' : 'Verified Location'}
                              </span>
                           </div>
                           <span className="text-[10px] text-muted-foreground font-mono">
                             IP: {log.ipAddress || "Internal Gateway"}
                           </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-6 text-right">
                         <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="w-4 h-4" />
                         </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
