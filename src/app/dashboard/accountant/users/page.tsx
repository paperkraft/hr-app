import { AddUserDialog } from "@/components/features/admin/add-user-dialog";
import { PageContainer } from "@/components/ui";
import { getAdminUsersData } from "@/actions/user";
import { UserManagementTable } from "@/components/features/admin/user-management-table";

export const dynamic = 'force-dynamic';

export default async function AccountantUsersPage() {
  const result = await getAdminUsersData();
  if (!result.success || !result.data) return <div>Error loading users</div>;
  const { users, validManagers, departments, locations } = result.data;

  return (
    <PageContainer maxWidth="full" className="py-8 animate-fade-in space-y-4">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight">Employees</h1>
          <p className="text-xs text-muted-foreground font-medium mt-0.5">Manage and collaborate within your organization's workforce</p>
        </div>
        <AddUserDialog
          managers={validManagers}
          departments={departments}
          locations={locations}
        />
      </div>

      <UserManagementTable
        initialUsers={users}
        validManagers={validManagers}
        departments={departments}
        locations={locations}
      />
    </PageContainer>
  );
}
