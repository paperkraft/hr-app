import { Badge } from "./badge";
import { cn } from "@/lib/utils";

export type StatusVariant =
    | "active"
    | "inactive"
    | "pending"
    | "completed"
    | "error"
    | "warning"
    | "info"
    | "success";

interface StatusBadgeProps {
    status: StatusVariant;
    label?: string;
    className?: string;
    size?: "sm" | "md";
    withDot?: boolean;
    animated?: boolean;
}

const statusConfig: Record<StatusVariant, {
    variant: any;
    color: string;
    dot: string;
    label: string;
}> = {
    active: {
        variant: "default",
        color: "bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-400",
        dot: "bg-green-500",
        label: "Active",
    },
    inactive: {
        variant: "secondary",
        color: "bg-slate-100 text-slate-800 dark:bg-slate-800/50 dark:text-slate-400",
        dot: "bg-slate-400",
        label: "Inactive",
    },
    pending: {
        variant: "outline",
        color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-400",
        dot: "bg-yellow-500",
        label: "Pending",
    },
    completed: {
        variant: "default",
        color: "bg-blue-100 text-blue-800 dark:bg-blue-950/30 dark:text-blue-400",
        dot: "bg-blue-500",
        label: "Completed",
    },
    error: {
        variant: "destructive",
        color: "bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-400",
        dot: "bg-red-500",
        label: "Error",
    },
    warning: {
        variant: "outline",
        color: "bg-orange-100 text-orange-800 dark:bg-orange-950/30 dark:text-orange-400",
        dot: "bg-orange-500",
        label: "Warning",
    },
    info: {
        variant: "secondary",
        color: "bg-cyan-100 text-cyan-800 dark:bg-cyan-950/30 dark:text-cyan-400",
        dot: "bg-cyan-500",
        label: "Info",
    },
    success: {
        variant: "default",
        color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400",
        dot: "bg-emerald-500",
        label: "Success",
    },
};

export function StatusBadge({
    status,
    label,
    className,
    size = "md",
    withDot = true,
    animated = false,
}: StatusBadgeProps) {
    const config = statusConfig[status];
    const displayLabel = label || config.label;

    return (
        <div
            className={cn(
                "inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium",
                config.color,
                animated && "animate-fade-in",
                className
            )}
        >
            {withDot && (
                <div
                    className={cn(
                        "w-2 h-2 rounded-full",
                        config.dot,
                        animated && "animate-pulse"
                    )}
                />
            )}
            <span>{displayLabel}</span>
        </div>
    );
}

/** Timeline Status - for showing progress through steps */
export type TimelineStatus = "completed" | "current" | "upcoming";

interface TimelineStepProps {
    status: TimelineStatus;
    label: string;
    className?: string;
}

export function TimelineStep({ status, label, className }: TimelineStepProps) {
    return (
        <div className={cn("flex flex-col items-center", className)}>
            <div
                className={cn(
                    "w-8 h-8 rounded-full border-2 flex items-center justify-center font-medium text-sm",
                    status === "completed" &&
                    "bg-green-500 border-green-500 text-white",
                    status === "current" &&
                    "bg-primary border-primary text-white ring-4 ring-primary/20 animate-pulse",
                    status === "upcoming" &&
                    "bg-muted border-border text-muted-foreground"
                )}
            >
                {status === "completed" && "✓"}
                {status === "current" && "○"}
                {status === "upcoming" && "○"}
            </div>
            <p className="text-xs font-medium mt-2 text-center">{label}</p>
        </div>
    );
}

/** Progress Ring - circular progress indicator */
export function ProgressRing({
    value,
    max = 100,
    size = 120,
    strokeWidth = 8,
    label,
    className,
    strokeColor,
}: {
    value: number;
    max?: number;
    size?: number;
    strokeWidth?: number;
    label?: string;
    className?: string;
    strokeColor?: string;
}) {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (value / max) * circumference;

    return (
        <div className={cn("flex flex-col items-center", className)}>
            <svg width={size} height={size} className="transform -rotate-90">
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    className="text-muted/20"
                />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className={cn("transition-all duration-500", strokeColor || "text-primary")}
                />
            </svg>
            {label && (
                <p className="text-xs font-semibold text-muted-foreground mt-2">
                    {label}
                </p>
            )}
        </div>
    );
}
