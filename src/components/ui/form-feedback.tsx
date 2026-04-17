import * as React from "react";
import {
    AlertCircle,
    CheckCircle2,
    Info,
    AlertTriangle,
    LucideIcon
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FormFeedbackProps {
    type?: "error" | "success" | "warning" | "info";
    message: string;
    className?: string;
    showIcon?: boolean;
    animated?: boolean;
}

const iconMap: Record<string, LucideIcon> = {
    error: AlertCircle,
    success: CheckCircle2,
    warning: AlertTriangle,
    info: Info,
};

const colorMap: Record<string, string> = {
    error: "text-destructive bg-destructive/10 border-destructive/30",
    success: "text-green-600 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-950/20 dark:border-green-900/30",
    warning: "text-yellow-600 bg-yellow-50 border-yellow-200 dark:text-yellow-400 dark:bg-yellow-950/20 dark:border-yellow-900/30",
    info: "text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-950/20 dark:border-blue-900/30",
};

export function FormFeedback({
    type = "info",
    message,
    className,
    showIcon = true,
    animated = true,
}: FormFeedbackProps) {
    const Icon = iconMap[type];

    return (
        <div
            className={cn(
                "flex items-start gap-3 px-3 py-2.5 rounded-lg border text-sm",
                colorMap[type],
                animated && "animate-fade-in-up",
                className
            )}
        >
            {showIcon && Icon && (
                <Icon className="w-4 h-4 flex-shrink-0 mt-0.5" />
            )}
            <span className="leading-relaxed">{message}</span>
        </div>
    );
}

/** Field Error - Displays validation errors for form fields */
export function FieldError({
    message,
    className,
}: {
    message?: string;
    className?: string;
}) {
    if (!message) return null;

    return (
        <div className={cn("flex items-center gap-1.5 mt-1.5 animate-fade-in-up", className)}>
            <AlertCircle className="w-3.5 h-3.5 text-destructive flex-shrink-0" />
            <span className="text-xs text-destructive font-medium">{message}</span>
        </div>
    );
}

/** Field Success - Displays validation success for form fields */
export function FieldSuccess({
    message,
    className,
}: {
    message?: string;
    className?: string;
}) {
    if (!message) return null;

    return (
        <div className={cn("flex items-center gap-1.5 mt-1.5 animate-fade-in-up", className)}>
            <CheckCircle2 className="w-3.5 h-3.5 text-green-600 dark:text-green-400 flex-shrink-0" />
            <span className="text-xs text-green-600 dark:text-green-400 font-medium">{message}</span>
        </div>
    );
}

/** Field Hint - Helper text for form fields */
export function FieldHint({
    message,
    className,
}: {
    message?: string;
    className?: string;
}) {
    if (!message) return null;

    return (
        <p className={cn("text-xs text-muted-foreground mt-1.5", className)}>
            {message}
        </p>
    );
}

/** Field State - Complete field feedback with icon and context */
export interface FieldStateProps {
    type?: "error" | "success" | "warning" | "info" | null;
    message?: string;
    hint?: string;
    className?: string;
}

export function FieldState({
    type,
    message,
    hint,
    className,
}: FieldStateProps) {
    return (
        <div className={cn("space-y-1.5", className)}>
            {message && type && (
                type === "error" ? (
                    <FieldError message={message} />
                ) : type === "success" ? (
                    <FieldSuccess message={message} />
                ) : (
                    <FormFeedback type={type} message={message} showIcon={false} />
                )
            )}
            {hint && !message && <FieldHint message={hint} />}
        </div>
    );
}

/** Toast-like Notification - For transient feedback */
export function NotificationFeedback({
    type = "info",
    message,
    onDismiss,
    autoClose = true,
    duration = 4000,
}: {
    type?: "error" | "success" | "warning" | "info";
    message: string;
    onDismiss?: () => void;
    autoClose?: boolean;
    duration?: number;
}) {
    React.useEffect(() => {
        if (autoClose && onDismiss) {
            const timer = setTimeout(onDismiss, duration);
            return () => clearTimeout(timer);
        }
    }, [autoClose, onDismiss, duration]);

    return (
        <div className="animate-slide-in-right">
            <FormFeedback
                type={type}
                message={message}
                className="shadow-lg"
            />
        </div>
    );
}
