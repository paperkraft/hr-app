import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-[#fcfcfc] dark:bg-background text-foreground selection:bg-primary/20">
      <Sidebar 
        userRole={session.user.role} 
        isTeamLeader={session.user.isTeamLeader ?? false} 
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          userName={session.user.name || session.user.email || "User"}
          userRole={session.user.role}
          isTeamLeader={session.user.isTeamLeader ?? false}
        />

        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}