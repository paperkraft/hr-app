import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

interface EmptyStateProps {
    icon?: LucideIcon;
    title: string;
    description?: string;
    action?: {
        label: string;
        onClick: () => void;
    };
    className?: string;
    variant?: "default" | "compact" | "minimal";
}

export function EmptyState({
    icon: Icon,
    title,
    description,
    action,
    className,
    variant = "default",
}: EmptyStateProps) {
    const containerClasses = {
        default: "flex flex-col items-center justify-center py-16 px-4",
        compact: "flex flex-col items-center justify-center py-8 px-4",
        minimal: "flex flex-col items-center justify-center py-4 px-2",
    };

    const iconClasses = {
        default: "w-16 h-16",
        compact: "w-12 h-12",
        minimal: "w-8 h-8",
    };

    const titleClasses = {
        default: "text-xl font-semibold mt-4",
        compact: "text-lg font-semibold mt-3",
        minimal: "text-base font-semibold mt-2",
    };

    const descriptionClasses = {
        default: "text-center text-muted-foreground mt-2 max-w-sm",
        compact: "text-center text-muted-foreground text-sm mt-1.5 max-w-sm",
        minimal: "text-center text-muted-foreground text-xs mt-1 max-w-xs",
    };

    return (
        <div
            className={cn(
                containerClasses[variant],
                "rounded-lg bg-card/50 border border-border/40",
                className
            )}
        >
            {Icon && (
                <Icon
                    className={cn(
                        iconClasses[variant],
                        "text-muted-foreground/50 animate-fade-in"
                    )}
                />
            )}

            <h3 className={cn(titleClasses[variant], "text-foreground animate-fade-in")}>
                {title}
            </h3>

            {description && (
                <p className={cn(descriptionClasses[variant], "animate-fade-in")}>
                    {description}
                </p>
            )}

            {action && (
                <Button
                    onClick={action.onClick}
                    className="mt-6 animate-fade-in"
                    size={variant === "minimal" ? "sm" : "default"}
                >
                    {action.label}
                </Button>
            )}
        </div>
    );
}
