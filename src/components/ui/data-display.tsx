import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface StatCardProps {
    icon?: ReactNode;
    label: string;
    value: string | number;
    subValue?: string;
    progress?: number; // 0 to 100
    progressColor?: string;
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
    className,
    onClick,
}: StatCardProps) {
    return (
        <div
            onClick={onClick}
            className={cn(
                "bg-card border border-border rounded p-5 relative overflow-hidden group transition-all duration-200",
                onClick && "cursor-pointer hover:shadow-md hover:border-primary/20",
                className
            )}
        >
            <div className="flex flex-col h-full justify-between gap-6">
                <div className="flex items-start justify-between w-full">
                    <p className="text-[13px] font-medium text-muted-foreground/80 tracking-tight">{label}</p>
                    {icon && (
                        <div className="text-muted-foreground/60 size-5 flex items-center justify-center transition-colors group-hover:text-primary">
                            {icon}
                        </div>
                    )}
                </div>

                <div className="space-y-1.5 mt-auto">
                    <h2 className="text-[32px] font-bold text-[#444] leading-none tracking-tight group-hover:text-primary transition-colors">
                        {value}
                    </h2>
                    {subValue && (
                        <p className="text-[13px] font-medium text-muted-foreground/60 tracking-tight">
                            {subValue}
                        </p>
                    )}
                </div>

                {progress !== undefined && (
                    <div className="w-full h-2 bg-primary/10 rounded-full overflow-hidden">
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
