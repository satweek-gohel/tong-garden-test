"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/store/authStore";
import { useApi } from "@/hooks/useApi";
import { userService } from "@/services/userService";
import { Badge } from "@/components/common/Badge";
import { Loader } from "@/components/common/Loader";

export default function AdminUsersPage() {
  return (
    <DashboardLayout>
      <AdminUsersContent />
    </DashboardLayout>
  );
}

function AdminUsersContent() {
  const { user } = useAuth();

  if (user && user.role !== "admin") {
    return (
      <div className="max-w-md">
        <h1 className="font-display text-[26px] font-semibold text-ink">Access denied</h1>
        <p className="text-sm text-muted mt-2">This page is only available to admins.</p>
      </div>
    );
  }

  return <UsersList />;
}

function UsersList() {
  const { data: users, loading, error } = useApi(() => userService.getAll(0, 50), []);

  return (
    <>
      <div>
        <h1 className="font-display text-[26px] font-semibold text-ink">Users</h1>
        <p className="text-sm text-muted mt-1.5">{users?.length ?? 0} accounts</p>
      </div>

      {loading && <Loader label="Loading users..." />}
      {error && <p className="text-danger text-sm">Failed to load users: {error.message}</p>}

      {!loading && !error && (
        <div className="bg-surface border border-line rounded-2xl overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="text-left text-xs font-semibold text-muted uppercase tracking-wide px-4 pt-[18px] pb-3">Name</th>
                <th className="text-left text-xs font-semibold text-muted uppercase tracking-wide px-4 pt-[18px] pb-3">Email</th>
                <th className="text-left text-xs font-semibold text-muted uppercase tracking-wide px-4 pt-[18px] pb-3">Role</th>
                <th className="text-left text-xs font-semibold text-muted uppercase tracking-wide px-4 pt-[18px] pb-3">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users?.map((u) => (
                <tr key={u.id} className="border-t border-line">
                  <td className="px-4 py-4 text-sm font-semibold">{u.full_name}</td>
                  <td className="px-4 py-4 text-sm text-muted">{u.email}</td>
                  <td className="px-4 py-4">
                    <Badge variant={u.role === "admin" ? "warning" : "default"} className="capitalize">
                      {u.role}
                    </Badge>
                  </td>
                  <td className="px-4 py-4 text-sm text-muted">{new Date(u.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
