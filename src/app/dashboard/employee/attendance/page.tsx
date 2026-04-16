import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Clock, Calendar, CheckCircle2, AlertCircle, LogOut, Coffee, Download, Filter, Search } from "lucide-react";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
    <div className="flex flex-col gap-8 p-6 lg:p-10 max-w-[1600px] mx-auto animate-in fade-in duration-700">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Attendance Logs</h1>
          <p className="text-slate-400 font-medium text-[15px]">Tracking your professional consistency and shift reliability.</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Button variant="outline" className="hiveq-btn-secondary h-11">
             <Download className="size-4 mr-2 text-slate-400" />
             Download CSV
          </Button>
          <Button className="hiveq-btn-primary h-11 px-6">
             Request Correction
          </Button>
        </div>
      </div>

      {/* Stats Summary Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="hiveq-card p-6 flex items-center justify-between border-l-4 border-l-slate-400">
           <div className="flex flex-col">
              <span className="text-3xl font-black text-slate-900 leading-none">{totalDays}</span>
              <span className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest leading-none">Total Logs</span>
           </div>
           <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center border border-slate-100 shadow-sm">
              <Calendar className="size-6" />
           </div>
        </div>

        <div className="hiveq-card p-6 flex items-center justify-between border-l-4 border-l-emerald-500">
           <div className="flex flex-col">
              <span className="text-3xl font-black text-emerald-600 leading-none">{onTimeCount}</span>
              <span className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest leading-none">On Time</span>
           </div>
           <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center border border-emerald-100 shadow-sm">
              <CheckCircle2 className="size-6" />
           </div>
        </div>

        <div className="hiveq-card p-6 flex items-center justify-between border-l-4 border-l-rose-500">
           <div className="flex flex-col">
              <span className="text-3xl font-black text-rose-600 leading-none">{lateCount}</span>
              <span className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest leading-none">Late Marks</span>
           </div>
           <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center border border-rose-100 shadow-sm">
              <AlertCircle className="size-6" />
           </div>
        </div>

        <div className="hiveq-card p-6 flex items-center justify-between border-l-4 border-l-amber-500">
           <div className="flex flex-col">
              <span className="text-3xl font-black text-amber-600 leading-none">{autoOutCount}</span>
              <span className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest leading-none">Auto Outs</span>
           </div>
           <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center border border-amber-100 shadow-sm">
              <LogOut className="size-6" />
           </div>
        </div>
      </div>

      {/* Main Table Card */}
      <Card className="hiveq-card p-0 overflow-hidden border-none shadow-sm">
        <CardHeader className="p-8 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
             <h3 className="text-lg font-black text-slate-900">Historical Records</h3>
             <Badge className="bg-slate-50 text-slate-400 border border-slate-100 rounded-lg text-[10px] py-0.5 px-2">Verified</Badge>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative group w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                 placeholder="Search logs..." 
                 className="pl-9 h-11 bg-slate-50 border-transparent focus:bg-white focus:border-slate-200 transition-all text-sm rounded-xl" 
              />
            </div>
            <Button variant="ghost" size="icon" className="h-11 w-11 rounded-xl border border-slate-100 text-slate-400">
               <Filter className="size-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="relative w-full overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50/50">
                <tr className="border-b border-slate-100">
                  <th className="h-14 px-8 text-[11px] font-black uppercase text-slate-400 text-left tracking-widest min-w-[200px]">Log Date</th>
                  <th className="h-14 px-8 text-[11px] font-black uppercase text-slate-400 text-left tracking-widest">Punch In</th>
                  <th className="h-14 px-8 text-[11px] font-black uppercase text-slate-400 text-left tracking-widest">Punch Out</th>
                  <th className="h-14 px-8 text-[11px] font-black uppercase text-slate-400 text-left tracking-widest">Status</th>
                  <th className="h-14 px-8 text-[11px] font-black uppercase text-slate-400 text-right tracking-widest">System Info</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {logs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-3 text-slate-300">
                        <Coffee className="w-12 h-12 opacity-20" />
                        <p className="text-sm font-black italic">No activity recorded for this period</p>
                      </div>
                    </td>
                  </tr>
                )}
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-5 align-middle">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 shadow-sm flex flex-col items-center justify-center group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-colors">
                             <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{new Date(log.date).toLocaleString('en-US', { month: 'short' })}</span>
                             <span className="text-sm font-black text-slate-900 leading-none">{new Date(log.date).getDate()}</span>
                          </div>
                          <span className="text-sm font-black text-slate-900">
                             {new Date(log.date).toLocaleDateString('en-US', { weekday: 'long' })}
                          </span>
                       </div>
                    </td>
                    <td className="px-8 py-5 align-middle">
                       <div className="flex flex-col">
                          <span className="text-sm font-black text-emerald-600">{new Date(log.punchIn).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Entry Point</span>
                       </div>
                    </td>
                    <td className="px-8 py-5 align-middle">
                       {log.punchOut ? (
                         <div className="flex flex-col">
                            <span className="text-sm font-black text-slate-700">{new Date(log.punchOut).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Exit Point</span>
                         </div>
                       ) : (
                         <Badge className="bg-slate-100 text-slate-400 border-none rounded-lg text-[10px] font-black">ACTIVE NOW</Badge>
                       )}
                    </td>
                    <td className="px-8 py-5 align-middle">
                       {log.isAutoPunchOut ? (
                         <Badge className="bg-amber-100 text-amber-600 border-none rounded-lg text-[10px] font-black uppercase tracking-tight">Auto-Out</Badge>
                       ) : log.isLateSpecialCase ? (
                         <Badge className="bg-blue-100 text-blue-600 border-none rounded-lg text-[10px] font-black uppercase tracking-tight">Approved</Badge>
                       ) : log.isLate ? (
                         <Badge className="bg-rose-100 text-rose-600 border-none rounded-lg text-[10px] font-black uppercase tracking-tight">Late Entry</Badge>
                       ) : (
                         <Badge className="bg-emerald-100 text-emerald-600 border-none rounded-lg text-[10px] font-black uppercase tracking-tight">Punctual</Badge>
                       )}
                    </td>
                    <td className="px-8 py-5 align-middle text-right">
                       <div className="flex flex-col items-end gap-1">
                          <span className="text-[11px] font-black text-slate-400 tracking-tight">{log.ipAddress || "Internal Server"}</span>
                          {log.isOutsideOffice && (
                            <span className="text-[9px] font-black text-rose-500 uppercase flex items-center gap-1">
                               <AlertCircle className="size-2.5" /> Off-Site Punch
                            </span>
                          )}
                       </div>
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
