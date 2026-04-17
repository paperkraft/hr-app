import { cn } from "@/lib/utils";

interface LoadingIndicatorProps {
    size?: "sm" | "md" | "lg";
    variant?: "spinner" | "dots" | "bar" | "pulse";
    text?: string;
    fullScreen?: boolean;
    className?: string;
}

export function LoadingIndicator({
    size = "md",
    variant = "spinner",
    text,
    fullScreen,
    className,
}: LoadingIndicatorProps) {
    const sizeClasses = {
        sm: "w-6 h-6",
        md: "w-8 h-8",
        lg: "w-12 h-12",
    };

    const container = fullScreen
        ? "fixed inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm z-50"
        : "flex flex-col items-center justify-center";

    return (
        <div className={cn(container, className)}>
            {variant === "spinner" && (
                <div
                    className={cn(
                        "rounded-full border-2 border-primary/20 border-t-primary animate-spin",
                        sizeClasses[size]
                    )}
                />
            )}

            {variant === "dots" && (
                <div className="flex gap-1.5">
                    {[0, 1, 2].map((i) => (
                        <div
                            key={i}
                            className={cn(
                                "rounded-full bg-primary animate-pulse",
                                size === "sm" ? "w-1.5 h-1.5" : size === "md" ? "w-2 h-2" : "w-3 h-3"
                            )}
                            style={{
                                animationDelay: `${i * 0.1}s`,
                            }}
                        />
                    ))}
                </div>
            )}

            {variant === "bar" && (
                <div className="w-48 h-1 bg-primary/20 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-transparent via-primary to-transparent animate-shimmer"
                        style={{ width: "30%" }}
                    />
                </div>
            )}

            {variant === "pulse" && (
                <div
                    className={cn(
                        "rounded-full bg-primary/30 animate-pulse",
                        sizeClasses[size]
                    )}
                />
            )}

            {text && (
                <p className="mt-4 text-sm text-muted-foreground font-medium animate-fade-in">
                    {text}
                </p>
            )}
        </div>
    );
}

/** Inline loading spinner - perfect for buttons and small areas */
export function LoadingSpinner({
    size = "sm",
    className,
}: {
    size?: "xs" | "sm" | "md";
    className?: string;
}) {
    const sizeClasses = {
        xs: "w-3 h-3",
        sm: "w-4 h-4",
        md: "w-5 h-5",
    };

    return (
        <div
            className={cn(
                "rounded-full border-2 border-current border-t-transparent animate-spin",
                sizeClasses[size],
                className
            )}
        />
    );
}

/** Skeleton Loading Shimmer Bar - for linear progress */
export function LoadingBar({ className }: { className?: string }) {
    return (
        <div className={cn("h-1 w-full bg-primary/10 rounded-full overflow-hidden", className)}>
            <div
                className="h-full bg-gradient-to-r from-transparent via-primary to-transparent animate-shimmer"
                style={{
                    width: "30%",
                    backgroundSize: "200% 100%",
                }}
            />
        </div>
    );
}
