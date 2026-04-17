import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ProfessionalSectionProps {
    title: string;
    description?: string;
    children: ReactNode;
    action?: ReactNode;
    className?: string;
    headerClassName?: string;
}

/**
 * Professional Section Component
 * Creates consistent section styling across all pages
 */
export function ProfessionalSection({
    title,
    description,
    children,
    action,
    className,
    headerClassName,
}: ProfessionalSectionProps) {
    return (
        <div className={cn('space-y-4', className)}>
            <div className={cn('flex items-start justify-between', headerClassName)}>
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold tracking-tight text-foreground">{title}</h2>
                    {description && (
                        <p className="text-sm text-muted-foreground">{description}</p>
                    )}
                </div>
                {action && <div className="flex-shrink-0">{action}</div>}
            </div>
            <div className="animate-fade-in">{children}</div>
        </div>
    );
}

interface ProfessionalCardProps {
    children: ReactNode;
    className?: string;
    interactive?: boolean;
}

/**
 * Professional Card Component
 * Premium card with consistent styling
 */
export function ProfessionalCard({
    children,
    className,
    interactive = false,
}: ProfessionalCardProps) {
    return (
        <div
            className={cn(
                'bg-card border border-border/40 rounded-xl p-6',
                'shadow-sm hover:shadow-md transition-shadow duration-200',
                interactive && 'cursor-pointer hover:border-border/60',
                className
            )}
        >
            {children}
        </div>
    );
}

interface MetricCardProps {
    icon: ReactNode;
    label: string;
    value: string | number;
    subtext?: string;
    color?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
    trend?: {
        value: string;
        direction: 'up' | 'down' | 'neutral';
    };
    className?: string;
}

/**
 * Metric Card Component
 * For displaying key metrics and statistics
 */
export function MetricCard({
    icon,
    label,
    value,
    subtext,
    color = 'primary',
    trend,
    className,
}: MetricCardProps) {
    const colorMap = {
        primary: 'text-primary',
        success: 'text-emerald-600',
        warning: 'text-amber-600',
        danger: 'text-red-600',
        info: 'text-cyan-600',
    };

    const trendColorMap = {
        up: 'text-emerald-600',
        down: 'text-red-600',
        neutral: 'text-muted-foreground',
    };

    return (
        <ProfessionalCard className={className}>
            <div className="space-y-3">
                <div className={cn('inline-flex p-2 rounded-lg bg-muted/10', colorMap[color])}>
                    {icon}
                </div>
                <div>
                    <p className="text-sm font-medium text-muted-foreground">{label}</p>
                    <div className="flex items-baseline justify-between mt-2">
                        <p className="text-3xl font-bold tracking-tight">{value}</p>
                        {trend && (
                            <span className={cn('text-sm font-medium', trendColorMap[trend.direction])}>
                                {trend.direction === 'up' ? '↑' : '↓'} {trend.value}
                            </span>
                        )}
                    </div>
                    {subtext && (
                        <p className="text-xs text-muted-foreground mt-2">{subtext}</p>
                    )}
                </div>
            </div>
        </ProfessionalCard>
    );
}

interface StatsGridProps {
    children: ReactNode;
    cols?: 1 | 2 | 3 | 4;
    className?: string;
}

/**
 * Stats Grid Component
 * Responsive grid for metric cards
 */
export function StatsGrid({
    children,
    cols = 3,
    className,
}: StatsGridProps) {
    const colsMap = {
        1: 'grid-cols-1',
        2: 'grid-cols-1 sm:grid-cols-2',
        3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
        4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    };

    return (
        <div className={cn('grid gap-6', colsMap[cols], className)}>
            {children}
        </div>
    );
}
