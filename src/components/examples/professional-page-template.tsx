/**
 * Professional Page Template
 * Copy this structure for all new/updated pages
 */

'use client'

import { useState } from 'react'
import {
    ProfessionalHeader,
    ProfessionalCard,
    MetricCard,
    StatsGrid,
    StatusIndicator,
    InformationRow,
    Divider,
} from '@/components/professional'
import { Button } from '@/components/ui/button'
import {
    Users,
    TrendingUp,
    Calendar,
    FileText,
    ArrowUpRight,
    ArrowDownLeft
} from 'lucide-react'

export default function YourPageName() {
    const [data, setData] = useState({
        totalItems: 1234,
        activeCount: 856,
        pendingCount: 42,
        completedCount: 336,
    })

    return (
        <div className="page-container space-section py-8">
            {/* ==================== PAGE HEADER ==================== */}
            <ProfessionalHeader
                title="Page Title"
                subtitle="Optional description of this page"
                action={<Button>Action Button</Button>}
            />

            {/* ==================== KEY METRICS ==================== */}
            <StatsGrid cols={4}>
                <MetricCard
                    icon={<Users className="w-5 h-5" />}
                    label="Total Items"
                    value={data.totalItems}
                    subtext="Overall count"
                    color="primary"
                    trend={{ value: '+12%', direction: 'up' }}
                />

                <MetricCard
                    icon={<TrendingUp className="w-5 h-5" />}
                    label="Active"
                    value={data.activeCount}
                    subtext="Currently active"
                    color="success"
                    trend={{ value: '+8%', direction: 'up' }}
                />

                <MetricCard
                    icon={<Calendar className="w-5 h-5" />}
                    label="Pending"
                    value={data.pendingCount}
                    subtext="Needs attention"
                    color="warning"
                    trend={{ value: '+4%', direction: 'up' }}
                />

                <MetricCard
                    icon={<FileText className="w-5 h-5" />}
                    label="Completed"
                    value={data.completedCount}
                    subtext="Finished items"
                    color="info"
                    trend={{ value: '+20%', direction: 'up' }}
                />
            </StatsGrid>

            {/* ==================== MAIN CONTENT GRID ==================== */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* ========== LEFT COLUMN ========== */}
                <ProfessionalCard>
                    <div className="space-card">
                        {/* Header with Icon */}
                        <div className="flex items-center gap-3 mb-6">
                            <div className="inline-flex p-2 rounded-lg bg-primary/10">
                                <Users className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <h3 className="heading-sm">Section Title</h3>
                                <p className="text-description">Optional subtitle</p>
                            </div>
                        </div>

                        {/* Divider */}
                        <Divider className="mb-6" />

                        {/* Content */}
                        <div className="space-y-4">
                            <InformationRow
                                label="Key Metric"
                                value="Value or Component"
                            />
                            <InformationRow
                                label="Another Metric"
                                value={
                                    <StatusIndicator
                                        status="active"
                                        label="Active"
                                        size="sm"
                                        showDot={true}
                                    />
                                }
                            />
                        </div>
                    </div>
                </ProfessionalCard>

                {/* ========== RIGHT COLUMN ========== */}
                <ProfessionalCard>
                    <div className="space-card">
                        {/* Header with Icon */}
                        <div className="flex items-center gap-3 mb-6">
                            <div className="inline-flex p-2 rounded-lg bg-emerald-500/10">
                                <TrendingUp className="w-6 h-6 text-emerald-600" />
                            </div>
                            <div>
                                <h3 className="heading-sm">Another Section</h3>
                                <p className="text-description">More content here</p>
                            </div>
                        </div>

                        {/* Divider */}
                        <Divider className="mb-6" />

                        {/* List Content */}
                        <div className="space-y-3">
                            {[1, 2, 3, 4, 5].map((item) => (
                                <div
                                    key={item}
                                    className="p-3 bg-muted/3 rounded-lg border border-border/40 hover:bg-muted/5 transition-colors cursor-pointer"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium text-sm">Item {item}</span>
                                        <StatusIndicator
                                            status={item % 2 === 0 ? 'active' : 'pending'}
                                            size="sm"
                                            showDot={true}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </ProfessionalCard>
            </div>

            {/* ==================== DATA TABLE SECTION ==================== */}
            <div className="space-card">
                <div className="flex items-center gap-3 mb-6">
                    <div className="inline-flex p-2 rounded-lg bg-blue-500/10">
                        <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="heading-md">Data Table</h3>
                        <p className="text-description">Comprehensive data display</p>
                    </div>
                </div>

                {/* Table */}
                <div className="border border-border/40 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-muted/5 border-b border-border/40">
                                <tr>
                                    <th className="table-cell font-semibold text-muted-foreground">
                                        Column 1
                                    </th>
                                    <th className="table-cell font-semibold text-muted-foreground">
                                        Column 2
                                    </th>
                                    <th className="table-cell font-semibold text-muted-foreground">
                                        Status
                                    </th>
                                    <th className="table-cell font-semibold text-muted-foreground text-right">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/40">
                                {/* Sample Rows */}
                                {[1, 2, 3, 4].map((item) => (
                                    <tr key={item} className="table-row-hover">
                                        <td className="table-cell">
                                            <div className="font-semibold">Data {item}</div>
                                            <div className="text-xs text-muted-foreground">
                                                Subtext {item}
                                            </div>
                                        </td>
                                        <td className="table-cell">Value {item}</td>
                                        <td className="table-cell">
                                            <StatusIndicator
                                                status={item % 2 === 0 ? 'active' : 'pending'}
                                                size="sm"
                                                showDot={true}
                                            />
                                        </td>
                                        <td className="table-cell text-right">
                                            <Button variant="outline" size="sm">
                                                Edit
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}
