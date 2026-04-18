"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { FileText, CheckCircle2 } from "lucide-react";

export function AccountantTabs() {
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || "report";

  const tabs = [
    { id: "report", name: "Master Report", icon: FileText, href: "?tab=report" },
    { id: "approvals", name: "History & Approvals", icon: CheckCircle2, href: "?tab=approvals" },
  ];

  return (
    <div className="w-full overflow-x-auto scrollbar-hide mb-6">
      <div className="flex items-center gap-1 bg-muted/10 p-1 rounded-sm w-fit border border-border/60 min-w-max">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          const href = tab.href +
            (searchParams.get("m") ? `&m=${searchParams.get("m")}` : "") +
            (searchParams.get("y") ? `&y=${searchParams.get("y")}` : "");

          return (
            <Link
              key={tab.id}
              href={href}
              className={cn(
                "flex items-center gap-2 h-8 px-4 rounded-sm text-[11px] font-bold uppercase tracking-widest transition-all duration-200 whitespace-nowrap",
                isActive
                  ? "bg-white text-primary shadow-sm border border-border/60"
                  : "text-muted-foreground/60 hover:text-foreground hover:bg-white/50"
              )}
            >
              <tab.icon className={cn("size-3.5", isActive ? "text-primary" : "text-muted-foreground/30")} />
              {tab.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
