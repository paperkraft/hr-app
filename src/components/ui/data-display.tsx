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
                "bg-white border border-border/60 rounded-sm shadow-sm p-5 relative overflow-hidden group",
                onClick && "cursor-pointer hover:bg-muted/5 transition-colors",
                className
            )}
        >
            <div className="flex flex-col h-full justify-between gap-3">
                <div className="flex items-start justify-between w-full">
                    <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.1em]">{label}</p>
                    {icon && (
                        <div className="text-muted-foreground/20 size-6 flex items-center justify-center -mt-0.5 -mr-0.5 transition-colors group-hover:text-primary/30">
                            {icon}
                        </div>
                    )}
                </div>

                <div className="space-y-0.5">
                    <p className="text-2xl font-bold text-foreground tracking-tight group-hover:text-primary transition-colors">{value}</p>
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

/** Info Card - Shows key-value information */
interface InfoCardProps {
    items: Array<{
        label: string;
        value: string | number | ReactNode;
    }>;
    className?: string;
    title?: string;
}

export function InfoCard({ items, className, title }: InfoCardProps) {
    return (
        <div className={cn("premium-card p-6 rounded-lg space-y-4", className)}>
            {title && <h3 className="text-lg font-semibold text-foreground">{title}</h3>}

            <div className="space-y-3">
                {items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-start gap-4">
                        <span className="text-sm text-muted-foreground font-medium">
                            {item.label}
                        </span>
                        <span className="text-sm font-semibold text-foreground text-right">
                            {item.value}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

/** Section Header - Professional heading for page sections */
interface SectionHeaderProps {
    title: string;
    description?: string;
    action?: ReactNode;
    className?: string;
}

export function SectionHeader({
    title,
    description,
    action,
    className,
}: SectionHeaderProps) {
    return (
        <div
            className={cn(
                "flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6",
                className
            )}
        >
            <div>
                <h2 className="text-2xl font-bold text-foreground">{title}</h2>
                {description && (
                    <p className="text-sm text-muted-foreground mt-1">{description}</p>
                )}
            </div>

            {action && <div className="flex-shrink-0">{action}</div>}
        </div>
    );
}

/** Grid Container - Professional grid layout */
interface GridProps {
    children: ReactNode;
    cols?: 1 | 2 | 3 | 4 | 5 | 6;
    gap?: "sm" | "md" | "lg";
    className?: string;
}

export function Grid({ children, cols = 3, gap = "md", className }: GridProps) {
    const colsClass = {
        1: "grid-cols-1",
        2: "grid-cols-1 md:grid-cols-2",
        3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
        4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
        5: "grid-cols-2 md:grid-cols-3 lg:grid-cols-5",
        6: "grid-cols-2 md:grid-cols-3 lg:grid-cols-6",
    };

    const gapClass = {
        sm: "gap-4",
        md: "gap-6",
        lg: "gap-8",
    };

    return (
        <div className={cn("grid", colsClass[cols], gapClass[gap], className)}>
            {children}
        </div>
    );
}

export function Divider({
    className,
    vertical,
    ...props
}: React.ComponentProps<"hr"> & { vertical?: boolean }) {
    return (
        <hr
            className={cn(
                vertical
                    ? "h-full w-px bg-border/40 shrink-0 mx-4"
                    : "w-full h-px bg-border/40 my-6",
                className
            )}
            {...props}
        />
    );
}

/** Badge Group - Multiple badges with proper spacing */
interface BadgeGroupProps {
    items: string[];
    onRemove?: (item: string) => void;
    className?: string;
}

export function BadgeGroup({ items, onRemove, className }: BadgeGroupProps) {
    const Badge = require("./badge").Badge;

    return (
        <div className={cn("flex flex-wrap gap-2", className)}>
            {items.map((item) => (
                <div
                    key={item}
                    className="relative group inline-block badge-md bg-secondary text-secondary-foreground"
                >
                    <span>{item}</span>
                    {onRemove && (
                        <button
                            onClick={() => onRemove(item)}
                            className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                        >
                            ✕
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
}
