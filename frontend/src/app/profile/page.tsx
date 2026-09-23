"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/common/Card";
import { Badge } from "@/components/common/Badge";
import { useAuth } from "@/store/authStore";

export default function ProfilePage() {
  return (
    <DashboardLayout>
      <ProfileContent />
    </DashboardLayout>
  );
}

function ProfileContent() {
  const { user } = useAuth();

  if (!user) return null;

  const initials = user.full_name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <>
      <div>
        <h1 className="font-display text-[26px] font-semibold text-ink">Profile</h1>
        <p className="text-sm text-muted mt-1.5">Your account details</p>
      </div>

      <Card variant="outlined" className="max-w-xl">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-primary text-[#F5F3EE] text-xl font-bold flex items-center justify-center shrink-0">
            {initials}
          </div>
          <div>
            <div className="text-lg font-semibold text-ink">{user.full_name}</div>
            <Badge variant={user.role === "admin" ? "warning" : "default"} className="capitalize mt-1">
              {user.role}
            </Badge>
          </div>
        </div>

        <dl className="grid grid-cols-1 gap-4 border-t border-line pt-5">
          <div>
            <dt className="text-xs font-semibold text-muted uppercase tracking-wide">Email</dt>
            <dd className="text-sm text-ink mt-1 flex items-center gap-2">
              {user.email}
              <Badge variant={user.is_verified ? "success" : "warning"}>
                {user.is_verified ? "Verified" : "Unverified"}
              </Badge>
            </dd>
          </div>
          {user.phone && (
            <div>
              <dt className="text-xs font-semibold text-muted uppercase tracking-wide">Phone</dt>
              <dd className="text-sm text-ink mt-1">{user.phone}</dd>
            </div>
          )}
          <div>
            <dt className="text-xs font-semibold text-muted uppercase tracking-wide">Account created</dt>
            <dd className="text-sm text-ink mt-1">
              {new Date(user.created_at).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </dd>
          </div>
        </dl>
      </Card>
    </>
  );
}
