"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Loader } from "@/components/common/Loader";
import { authService } from "@/services/authService";
import { useAuthStore } from "@/store/authStore";

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<Loader label="Loading..." />}>
      <VerifyEmailContent />
    </Suspense>
  );
}

type Status = "pending" | "success" | "error";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<Status>("pending");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setError("No verification token found in the URL.");
      return;
    }

    authService
      .verifyEmail(token)
      .then(() => {
        setStatus("success");
        useAuthStore.getState().hydrate();
      })
      .catch((err) => {
        setStatus("error");
        setError(err instanceof Error ? err.message : "This link is invalid or has expired.");
      });
  }, [token]);

  return (
    <AuthLayout>
      <Card variant="elevated" className="w-full max-w-[400px] p-11 rounded-2xl text-center">
        {status === "pending" && <Loader label="Verifying your email..." />}

        {status === "success" && (
          <>
            <h1 className="font-display text-[26px] font-semibold text-ink mb-1.5">Email verified</h1>
            <p className="text-sm text-muted mb-8">
              Your account is fully unlocked — you can now create products and orders.
            </p>
            <Link href="/">
              <Button fullWidth>Go to dashboard</Button>
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <h1 className="font-display text-[26px] font-semibold text-ink mb-1.5">Verification failed</h1>
            <p className="text-sm text-danger mb-8">{error}</p>
            <Link href="/login" className="text-sm text-primary font-semibold hover:text-primary-dark">
              Back to sign in
            </Link>
          </>
        )}
      </Card>
    </AuthLayout>
  );
}
