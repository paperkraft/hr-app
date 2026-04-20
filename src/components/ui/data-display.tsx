import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface StatCardProps {
    icon?: ReactNode;
    label: string;
    value: string | number;
    subValue?: string;
    progress?: number; // 0 to 100
    progressColor?: string;
    change?: {
        value: number | string;
        trend: "up" | "down" | "neutral";
    };
    className?: string;
    onClick?: () => void;
}

export function StatCard({
    icon,
    label,
    value,
    subValue,
    progress,
    progressColor = "bg-primary",
    change,
    className,
    onClick,
}: StatCardProps) {
    return (
        <div
            onClick={onClick}
            className={cn(
                "bg-card border border-border rounded-sm p-4 relative overflow-hidden group",
                onClick && "cursor-pointer hover:bg-muted/30 transition-colors",
                className
            )}
        >
            <div className="flex flex-col h-full justify-between gap-3">
                <div className="flex items-start justify-between w-full">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{label}</p>
                    {icon && (
                        <div className="text-muted-foreground size-6 flex items-center justify-center -mt-0.5 -mr-0.5 transition-colors group-hover:text-primary/30">
                            {icon}
                        </div>
                    )}
                </div>

                <div className="space-y-0.5">
                    <p className="text-2xl font-bold text-muted-foreground tracking-tight group-hover:text-primary transition-colors">{value}</p>
                    {subValue && (
                        <p className="text-[10px] font-bold text-muted-foreground/60 tracking-tight lowercase first-letter:uppercase">{subValue}</p>
                    )}
                </div>

                {change && (
                    <div className="flex items-center gap-1.5">
                        <span
                            className={cn(
                                "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border",
                                change.trend === "up"
                                    ? "text-emerald-600 bg-emerald-500/5 border-emerald-500/10"
                                    : change.trend === "down"
                                        ? "text-rose-600 bg-rose-500/5 border-rose-500/10"
                                        : "text-muted-foreground bg-muted/5 border-border/40"
                                    )}
                        >
                            {change.trend === "up" && "↑ "}
                            {change.trend === "down" && "↓ "}
                            {change.value}
                        </span>
                        <span className="text-[9px] text-muted-foreground/50 font-black uppercase tracking-widest">Variation</span>
                    </div>
                )}

                {progress !== undefined && (
                    <div className="w-full h-1.5 bg-muted/20 rounded-full overflow-hidden mt-2">
                        <div
                            className={cn("h-full transition-all duration-1000 ease-out rounded-full", progressColor)}
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
