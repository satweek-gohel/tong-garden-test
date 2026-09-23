"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/store/authStore";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { TextInput } from "@/components/forms/TextInput";
import { AuthLayout } from "@/components/layout/AuthLayout";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(email, password);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <Card variant="elevated" className="w-full max-w-[400px] p-11 rounded-2xl">
        <h1 className="font-display text-[26px] font-semibold text-ink mb-1.5">Sign in</h1>
        <p className="text-sm text-muted mb-8">Welcome back to Tong Garden Operations</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-[18px]">
          <TextInput
            label="Email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ops@tonggarden.com"
          />
          <div>
            <TextInput
              label="Password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
            <Link href="/forgot-password" className="block mt-2 text-xs font-semibold text-primary hover:text-primary-dark">
              Forgot password?
            </Link>
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}

          <Button type="submit" fullWidth isLoading={isSubmitting} className="mt-1.5">
            Sign in
          </Button>
        </form>

        <div className="flex items-center gap-3 my-7">
          <div className="flex-grow h-px bg-line" />
          <span className="text-muted text-xs">or</span>
          <div className="flex-grow h-px bg-line" />
        </div>

        <p className="text-sm text-center text-muted">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-primary font-semibold hover:text-primary-dark">
            Sign up
          </Link>
        </p>
      </Card>
    </AuthLayout>
  );
}
