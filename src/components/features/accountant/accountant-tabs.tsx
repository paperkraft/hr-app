"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { FileText, CheckCircle2, Settings } from "lucide-react";

export function AccountantTabs() {
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || "report";

  const tabs = [
    {
      id: "report",
      name: "Master Report",
      icon: FileText,
      href: "?tab=report",
    },
    {
      id: "approvals",
      name: "Recent Approvals",
      icon: CheckCircle2,
      href: "?tab=approvals",
    },
  ];

  return (
    <div className="w-full overflow-x-auto scrollbar-hide mb-8">
      <div className="flex items-center gap-1 bg-muted/30 p-1 rounded-xl w-fit border border-border/40 min-w-max">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap",
                isActive
                  ? "bg-background text-primary shadow-sm ring-1 ring-border/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <tab.icon className={cn("size-4", isActive ? "text-primary" : "text-muted-foreground")} />
              {tab.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
