import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface StatusIndicatorProps {
    status: 'active' | 'inactive' | 'pending' | 'completed' | 'error' | 'warning' | 'paid' | 'unpaid';
    label?: string;
    size?: 'sm' | 'md' | 'lg';
    showDot?: boolean;
}

/**
 * Status Indicator Component
 * Professional status badges matching reference design
 */
export function StatusIndicator({
    status,
    label,
    size = 'md',
    showDot = true,
}: StatusIndicatorProps) {
    const statusConfig = {
        active: {
            bg: 'bg-emerald-50 dark:bg-emerald-950/30',
            text: 'text-emerald-700 dark:text-emerald-300',
            dot: 'bg-emerald-600',
            badge: 'Active',
        },
        inactive: {
            bg: 'bg-gray-50 dark:bg-gray-950/30',
            text: 'text-gray-700 dark:text-gray-300',
            dot: 'bg-gray-600',
            badge: 'Inactive',
        },
        pending: {
            bg: 'bg-red-50 dark:bg-red-950/30',
            text: 'text-red-700 dark:text-red-300',
            dot: 'bg-red-600',
            badge: 'Pending',
        },
        completed: {
            bg: 'bg-blue-50 dark:bg-blue-950/30',
            text: 'text-blue-700 dark:text-blue-300',
            dot: 'bg-blue-600',
            badge: 'Completed',
        },
        paid: {
            bg: 'bg-blue-50 dark:bg-blue-950/30',
            text: 'text-blue-700 dark:text-blue-300',
            dot: 'bg-blue-600',
            badge: 'Paid',
        },
        unpaid: {
            bg: 'bg-gray-50 dark:bg-gray-950/30',
            text: 'text-gray-700 dark:text-gray-300',
            dot: 'bg-gray-600',
            badge: 'Unpaid',
        },
        error: {
            bg: 'bg-red-50 dark:bg-red-950/30',
            text: 'text-red-700 dark:text-red-300',
            dot: 'bg-red-600',
            badge: 'Error',
        },
        warning: {
            bg: 'bg-amber-50 dark:bg-amber-950/30',
            text: 'text-amber-700 dark:text-amber-300',
            dot: 'bg-amber-600',
            badge: 'Warning',
        },
    };

    const config = statusConfig[status];
    const sizeMap = {
        sm: 'text-xs px-2 py-1',
        md: 'text-sm px-3 py-1.5',
        lg: 'text-base px-4 py-2',
    };

    const dotSizeMap = {
        sm: 'w-1.5 h-1.5',
        md: 'w-2 h-2',
        lg: 'w-2.5 h-2.5',
    };

    return (
        <span
            className={cn(
                'inline-flex items-center gap-2 rounded-full font-medium',
                config.bg,
                config.text,
                sizeMap[size]
            )}
        >
            {showDot && <span className={cn('rounded-full', config.dot, dotSizeMap[size])} />}
            {label || config.badge}
        </span>
    );
}

interface ProfessionalTableProps {
    headers: Array<{
        key: string;
        label: string;
        align?: 'left' | 'center' | 'right';
        sortable?: boolean;
    }>;
    rows: Array<Record<string, ReactNode>>;
    className?: string;
    striped?: boolean;
    hoverable?: boolean;
    compact?: boolean;
}

/**
 * Professional Table Component
 * Matches reference design for data display
 */
export function ProfessionalTable({
    headers,
    rows,
    className,
    striped = true,
    hoverable = true,
    compact = false,
}: ProfessionalTableProps) {
    const alignMap = {
        left: 'text-left',
        center: 'text-center',
        right: 'text-right',
    };

    return (
        <div className={cn('w-full overflow-hidden border border-border/40 rounded-lg', className)}>
            <table className="w-full">
                <thead className="bg-muted/5 border-b border-border/40">
                    <tr>
                        {headers.map((header) => (
                            <th
                                key={header.key}
                                className={cn(
                                    'px-6 py-4 text-sm font-semibold text-foreground',
                                    alignMap[header.align || 'left'],
                                    compact && 'px-4 py-2'
                                )}
                            >
                                <div className="flex items-center gap-2">
                                    {header.label}
                                    {header.sortable && (
                                        <span className="text-muted-foreground text-xs">⇅</span>
                                    )}
                                </div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                    {rows.map((row, idx) => (
                        <tr
                            key={idx}
                            className={cn(
                                'transition-colors duration-150',
                                striped && idx % 2 === 1 && 'bg-muted/3',
                                hoverable && 'hover:bg-muted/5'
                            )}
                        >
                            {headers.map((header) => (
                                <td
                                    key={`${idx}-${header.key}`}
                                    className={cn(
                                        'px-6 py-4 text-sm text-foreground',
                                        alignMap[header.align || 'left'],
                                        compact && 'px-4 py-2'
                                    )}
                                >
                                    {row[header.key]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
            {rows.length === 0 && (
                <div className="px-6 py-12 text-center">
                    <p className="text-muted-foreground">No data available</p>
                </div>
            )}
        </div>
    );
}

interface ProfessionalHeaderProps {
    title: string;
    subtitle?: string;
    action?: ReactNode;
    className?: string;
}

/**
 * Professional Header Component
 * Page header with consistent styling
 */
export function ProfessionalHeader({
    title,
    subtitle,
    action,
    className,
}: ProfessionalHeaderProps) {
    return (
        <div className={cn('space-y-2', className)}>
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight text-foreground">{title}</h1>
                    {subtitle && (
                        <p className="text-muted-foreground mt-2">{subtitle}</p>
                    )}
                </div>
                {action && <div>{action}</div>}
            </div>
        </div>
    );
}

interface DividerProps {
    className?: string;
    vertical?: boolean;
}

/**
 * Professional Divider Component
 * Subtle separator for sections
 */
export function Divider({ className, vertical = false }: DividerProps) {
    return vertical ? (
        <div
            className={cn('w-px h-8 bg-border/40', className)}
        />
    ) : (
        <div
            className={cn('h-px w-full bg-border/40', className)}
        />
    );
}

interface InformationRowProps {
    label: string;
    value: ReactNode;
    className?: string;
    labelClassName?: string;
    valueClassName?: string;
}

/**
 * Information Row Component
 * For displaying key-value pairs in profiles
 */
export function InformationRow({
    label,
    value,
    className,
    labelClassName,
    valueClassName,
}: InformationRowProps) {
    return (
        <div className={cn('flex items-center justify-between py-3', className)}>
            <span className={cn('text-sm font-medium text-muted-foreground', labelClassName)}>
                {label}
            </span>
            <span className={cn('text-sm font-semibold text-foreground', valueClassName)}>
                {value}
            </span>
        </div>
    );
}

interface HighlightBoxProps {
    children: ReactNode;
    type?: 'info' | 'warning' | 'success' | 'error';
    className?: string;
}

/**
 * Highlight Box Component
 * For important information display
 */
export function HighlightBox({
    children,
    type = 'info',
    className,
}: HighlightBoxProps) {
    const typeMap = {
        info: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800/50',
        warning: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/50',
        success: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/50',
        error: 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800/50',
    };

    return (
        <div
            className={cn(
                'p-4 rounded-lg border',
                typeMap[type],
                className
            )}
        >
            {children}
        </div>
    );
}
