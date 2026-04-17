/**
 * Example: Professional Dashboard Page
 * 
 * This example shows how to use the new professional UI components together
 * to create a polished, premium-looking dashboard page.
 * 
 * Copy and adapt this pattern to other pages in your application.
 */

"use client";

import { useState } from "react";
import {
    PageContainer,
    PageHeader,
    ContentArea,
    MainContent,
    Sidebar,
    PageSection,
    SectionHeader,
    StatCard,
    Grid,
    InfoCard,
    EmptyState,
    Button,
    Breadcrumb,
    BreadcrumbList,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbSeparator,
    BreadcrumbPage,
    StatusBadge,
    LoadingIndicator,
    LoadingSpinner,
    CardSkeleton,
    FieldError,
    FieldSuccess,
} from "@/components/ui";
import {
    Users,
    Calendar,
    AlertCircle,
    CheckCircle2,
    Package,
    TrendingUp,
} from "lucide-react";
import Link from "next/link";

export function DashboardPageExample() {
    const [loading, setLoading] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    // Breadcrumb Navigation
    const breadcrumb = (
        <Breadcrumb>
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                        <Link href="/dashboard">Dashboard</Link>
                    </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                    <BreadcrumbPage>Admin</BreadcrumbPage>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>
    );

    // Page Action
    const pageAction = (
        <Button
            onClick={() => {
                setLoading(true);
                setTimeout(() => {
                    setLoading(false);
                    setSaveSuccess(true);
                    setTimeout(() => setSaveSuccess(false), 4000);
                }, 2000);
            }}
        >
            {loading && <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin mr-2" />}
            Update Dashboard
        </Button>
    );

    return (
        <PageContainer>
            {/* Page Header with Breadcrumb and Title */}
            <PageHeader
                title="Admin Dashboard"
                description="System overview and key metrics"
                breadcrumb={breadcrumb}
                action={pageAction}
            />

            {/* Success Message */}
            {saveSuccess && (
                <div className="mb-6 animate-fade-in-up">
                    <FieldSuccess message="Dashboard updated successfully!" />
                </div>
            )}

            {/* Main Content Area with Optional Sidebar */}
            <ContentArea>
                <MainContent>
                    {/* Key Metrics Section */}
                    <PageSection title="Key Metrics" description="System overview">
                        {loading ? (
                            <Grid cols={4} gap="md">
                                {[1, 2, 3, 4].map((i) => (
                                    <CardSkeleton key={i} />
                                ))}
                            </Grid>
                        ) : (
                            <Grid cols={4} gap="md">
                                <StatCard
                                    icon={<Users />}
                                    label="Total Employees"
                                    value="1,234"
                                    change={{ value: "+12%", trend: "up" }}
                                />
                                <StatCard
                                    icon={<Calendar />}
                                    label="On Leave Today"
                                    value="45"
                                    change={{ value: "-8%", trend: "down" }}
                                />
                                <StatCard
                                    icon={<CheckCircle2 />}
                                    label="Attendance Rate"
                                    value="96.5%"
                                    change={{ value: "+2.3%", trend: "up" }}
                                />
                                <StatCard
                                    icon={<AlertCircle />}
                                    label="Pending Tasks"
                                    value="23"
                                    change={{ value: "+5", trend: "neutral" }}
                                />
                            </Grid>
                        )}
                    </PageSection>

                    {/* Data Table Section */}
                    <PageSection
                        title="Recent Activity"
                        description="Latest employee records"
                        className="mt-6"
                    >
                        {loading ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="h-12 rounded-lg bg-muted animate-shimmer" />
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {/* Example table rows with status badges */}
                                {[
                                    { id: 1, name: "John Doe", dept: "Engineering", status: "active" },
                                    { id: 2, name: "Jane Smith", dept: "HR", status: "pending" },
                                    { id: 3, name: "Bob Johnson", dept: "Finance", status: "completed" },
                                ].map((employee) => (
                                    <div
                                        key={employee.id}
                                        className="flex items-center justify-between p-4 rounded-lg bg-card border border-border/40 hover:shadow-md transition-all duration-200 animate-fade-in"
                                    >
                                        <div>
                                            <p className="font-medium text-foreground">{employee.name}</p>
                                            <p className="text-sm text-muted-foreground">{employee.dept}</p>
                                        </div>
                                        <StatusBadge status={employee.status as any} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </PageSection>

                    {/* Empty State Example */}
                    <PageSection
                        title="No Data Available"
                        description="Example empty state"
                        className="mt-6"
                    >
                        <EmptyState
                            icon={Package}
                            title="No records found"
                            description="Try adjusting your filters or create a new record to get started."
                            action={{
                                label: "Create Record",
                                onClick: () => alert("Create new record"),
                            }}
                            variant="compact"
                        />
                    </PageSection>
                </MainContent>

                {/* Sidebar */}
                <Sidebar>
                    {/* Quick Info Card */}
                    <PageSection title="Quick Info">
                        <InfoCard
                            items={[
                                { label: "Last Updated", value: "5 mins ago" },
                                { label: "System Status", value: "Normal" },
                                { label: "Active Users", value: "234" },
                                { label: "Database Size", value: "2.4 GB" },
                            ]}
                        />
                    </PageSection>

                    {/* Status Cards */}
                    <PageSection title="Status" className="space-y-3">
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">System Health</span>
                                <StatusBadge status="active" withDot animated />
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">Database</span>
                                <StatusBadge status="active" withDot animated />
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">API Service</span>
                                <StatusBadge status="active" withDot animated />
                            </div>
                        </div>
                    </PageSection>

                    {/* Loading Indicator Example */}
                    {loading && (
                        <PageSection title="Processing...">
                            <LoadingIndicator
                                variant="dots"
                                size="md"
                                text="Updating dashboard..."
                            />
                        </PageSection>
                    )}
                </Sidebar>
            </ContentArea>
        </PageContainer>
    );
}

/**
 * Usage Patterns for Common Scenarios
 */

// Pattern 1: List with Loading & Empty State
export function ListPatternExample() {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    return (
        <PageSection>
            {loading ? (
                <CardSkeleton />
            ) : items.length === 0 ? (
                <EmptyState
                    icon={Package}
                    title="No items"
                    action={{ label: "Create New", onClick: () => { } }}
                />
            ) : (
                <div className="space-y-2">
                    {items.map((item) => (
                        <div key={item.id} className="animate-fade-in">
                            {item.name}
                        </div>
                    ))}
                </div>
            )}
        </PageSection>
    );
}

// Pattern 2: Form with Validation Feedback
export function FormPatternExample() {
    const [formData, setFormData] = useState({ email: "" });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        // Validate
        const newErrors: Record<string, string> = {};
        if (!formData.email) newErrors.email = "Email is required";

        setErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {
            // Submit
            setSubmitting(true);
            setTimeout(() => {
                setSubmitting(false);
                alert("Submitted!");
            }, 2000);
        }
    };

    return (
        <PageSection>
            <div className="space-y-4">
                <div>
                    <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg"
                        placeholder="Enter email"
                    />
                    {errors.email && <FieldError message={errors.email} />}
                </div>
                <Button onClick={handleSubmit} disabled={submitting}>
                    {submitting && <span className="inline-block w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin mr-2" />}
                    Submit
                </Button>
            </div>
        </PageSection>
    );
}

// Pattern 3: Data Display with Status
export function DataDisplayPatternExample() {
    const employees = [
        { id: 1, name: "Alice", status: "active", dept: "IT" },
        { id: 2, name: "Bob", status: "pending", dept: "HR" },
        { id: 3, name: "Charlie", status: "completed", dept: "Finance" },
    ];

    return (
        <PageSection>
            <Grid cols={3}>
                {employees.map((emp) => (
                    <div key={emp.id} className="premium-card p-4 animate-fade-in-up">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <p className="font-semibold">{emp.name}</p>
                                <p className="text-sm text-muted-foreground">{emp.dept}</p>
                            </div>
                            <StatusBadge status={emp.status as any} />
                        </div>
                    </div>
                ))}
            </Grid>
        </PageSection>
    );
}

/**
 * CSS Class Examples - Professional Styling
 * 
 * Use these classes with your components:
 * 
 * <div className="animate-fade-in">Content</div>
 * <div className="premium-card p-6">Card</div>
 * <button className="hover-lift transition-smooth">Button</button>
 * 
 * For animations:
 * - animate-fade-in: Fade in
 * - animate-fade-in-up: Fade in with movement
 * - animate-scale-in: Scale in
 * - animate-slide-in-right: Slide in from right
 * - animate-shimmer: Shimmer loading effect
 * 
 * For interactions:
 * - hover-lift: Elevation on hover
 * - hover-glow: Glow effect on hover
 * - focus-ring: Professional focus ring
 * - transition-smooth: Smooth transitions
 * - transition-bounce: Bouncy transitions
 */

// Export for use in your pages
export default DashboardPageExample;
