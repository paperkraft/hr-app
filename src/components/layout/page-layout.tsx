import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface PageContainerProps {
    children: ReactNode;
    className?: string;
    maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
    animate?: boolean;
}

export function PageContainer({
    children,
    className,
    maxWidth = "2xl",
    animate = true,
}: PageContainerProps) {
    const maxWidthClasses = {
        sm: "max-w-sm",
        md: "max-w-md",
        lg: "max-w-lg",
        xl: "max-w-xl",
        "2xl": "max-w-2xl",
        full: "max-w-full",
    };

    return (
        <div
            className={cn(
                "mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8",
                maxWidthClasses[maxWidth],
                animate && "animate-fade-in",
                className
            )}
        >
            {children}
        </div>
    );
}

interface PageHeaderProps {
    title: string;
    description?: string;
    breadcrumb?: ReactNode;
    action?: ReactNode;
    className?: string;
}

export function PageHeader({
    title,
    description,
    breadcrumb,
    action,
    className,
}: PageHeaderProps) {
    return (
        <div className={cn("mb-8", className)}>
            {breadcrumb && <div className="mb-4 animate-fade-in-down">{breadcrumb}</div>}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="animate-fade-in">
                    <h1 className="text-3xl font-bold text-foreground">{title}</h1>
                    {description && (
                        <p className="mt-2 text-base text-muted-foreground">{description}</p>
                    )}
                </div>

                {action && (
                    <div className="flex-shrink-0 animate-fade-in-up">{action}</div>
                )}
            </div>
        </div>
    );
}

interface ContentAreaProps {
    children: ReactNode;
    className?: string;
    withSidebar?: boolean;
}

export function ContentArea({
    children,
    className,
    withSidebar = false,
}: ContentAreaProps) {
    return (
        <div
            className={cn(
                withSidebar
                    ? "grid gap-6 lg:grid-cols-3"
                    : "w-full",
                className
            )}
        >
            {children}
        </div>
    );
}

interface MainContentProps {
    children: ReactNode;
    className?: string;
}

export function MainContent({ children, className }: MainContentProps) {
    return <div className={cn("lg:col-span-2", className)}>{children}</div>;
}

interface SidebarProps {
    children: ReactNode;
    className?: string;
}

export function Sidebar({ children, className }: SidebarProps) {
    return (
        <aside className={cn("space-y-6", className)}>
            {children}
        </aside>
    );
}

interface PageSectionProps {
    title?: string;
    description?: string;
    children: ReactNode;
    className?: string;
    noPadding?: boolean;
}

export function PageSection({
    title,
    description,
    children,
    className,
    noPadding = false,
}: PageSectionProps) {
    return (
        <section
            className={cn(
                "rounded-lg border border-border/40",
                !noPadding && "p-6",
                className
            )}
        >
            {(title || description) && (
                <div className={noPadding ? "px-6 pt-6 pb-4" : "mb-6 pb-4 border-b border-border/40"}>
                    {title && (
                        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
                    )}
                    {description && (
                        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
                    )}
                </div>
            )}

            <div className={title || description ? (noPadding ? "px-6 pb-6" : "") : ""}>
                {children}
            </div>
        </section>
    );
}

interface PageFooterProps {
    children: ReactNode;
    className?: string;
    sticky?: boolean;
}

export function PageFooter({
    children,
    className,
    sticky = false,
}: PageFooterProps) {
    return (
        <footer
            className={cn(
                "flex items-center justify-between gap-4 border-t border-border/40 pt-6 mt-8",
                sticky && "fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur px-4 md:px-6 py-4",
                className
            )}
        >
            {children}
        </footer>
    );
}

/** Loading Page - Skeleton version of a page */
export function LoadingPage() {
    return (
        <PageContainer>
            <div className="space-y-8 animate-pulse">
                <div className="space-y-2">
                    <div className="h-8 w-48 rounded-lg bg-muted" />
                    <div className="h-4 w-96 rounded-lg bg-muted" />
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-32 rounded-lg bg-muted" />
                    ))}
                </div>

                <div className="h-96 rounded-lg bg-muted" />
            </div>
        </PageContainer>
    );
}
