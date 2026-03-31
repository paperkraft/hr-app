import { Activity, ShieldCheck, Users } from "lucide-react";
import { LoginForm } from "@/components/features/auth/login-form";

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-background">

      {/* Left Column: Branding (Hidden on small mobile screens) */}
      <div className="hidden md:flex flex-col justify-between w-1/2 bg-primary/5 p-10 lg:p-16 border-r border-border/50">
        <div className="flex items-center gap-2 text-primary">
          <Activity className="w-8 h-8" />
          <span className="font-bold text-2xl tracking-tight">Sigma HRMS</span>
        </div>

        <div className="max-w-md space-y-6">
          <h2 className="text-4xl font-bold tracking-tight text-foreground">
            Manage your team, <br />
            <span className="text-primary">seamlessly.</span>
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            The all-in-one platform for attendance tracking, leave management, and complex policy compliance. Built for modern enterprises.
          </p>

          <div className="flex gap-4 pt-4">
            <div className="flex items-center gap-2 text-sm font-medium bg-background border border-border/50 px-4 py-2 rounded-full shadow-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Secure Access
            </div>
            <div className="flex items-center gap-2 text-sm font-medium bg-background border border-border/50 px-4 py-2 rounded-full shadow-sm">
              <Users className="w-4 h-4 text-blue-600" /> Role-Based Routing
            </div>
          </div>
        </div>

        <div className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Sigma. All rights reserved.
        </div>
      </div>

      {/* Right Column: Authentication Form */}
      <div className="flex-1 flex items-center justify-center p-8 sm:p-12 lg:p-16">
        {/* Mobile Logo (Visible only on small screens) */}
        <div className="absolute top-8 left-8 md:hidden flex items-center gap-2 text-primary">
          <Activity className="w-6 h-6" />
          <span className="font-bold text-xl tracking-tight">Sigma HRMS</span>
        </div>

        <LoginForm />
      </div>

    </div>
  );
}