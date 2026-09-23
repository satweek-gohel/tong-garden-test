"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { TextInput } from "@/components/forms/TextInput";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { authService } from "@/services/authService";
import { validators } from "@/utils/validation";

type Step = "email" | "reset" | "done";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ password?: string; confirmPassword?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const res = await authService.forgotPassword(email);
      setDevOtp(res.dev_otp);
      setStep("reset");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!/^\d{6}$/.test(otp)) {
      setError("Enter the 6-digit code.");
      return;
    }

    const passwordError = validators.password(password);
    const confirmError = password !== confirmPassword ? "Passwords do not match" : undefined;
    if (passwordError || confirmError) {
      setFieldErrors({ password: passwordError, confirmPassword: confirmError });
      return;
    }
    setFieldErrors({});

    setIsSubmitting(true);
    try {
      await authService.resetPassword(email, otp, password, confirmPassword);
      setStep("done");
      setTimeout(() => router.push("/login"), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid email or code");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <Card variant="elevated" className="w-full max-w-[400px] p-11 rounded-2xl">
        {step === "email" && (
          <>
            <h1 className="font-display text-[26px] font-semibold text-ink mb-1.5">Forgot password</h1>
            <p className="text-sm text-muted mb-8">We&apos;ll send a one-time code to your email</p>

            <form onSubmit={handleRequestOtp} className="flex flex-col gap-[18px]">
              <TextInput
                label="Email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ops@tonggarden.com"
              />

              {error && <p className="text-sm text-danger">{error}</p>}

              <Button type="submit" fullWidth isLoading={isSubmitting} className="mt-1.5">
                Send code
              </Button>

              <Link href="/login" className="text-sm text-center text-muted hover:text-ink">
                Back to sign in
              </Link>
            </form>
          </>
        )}

        {step === "reset" && (
          <>
            <h1 className="font-display text-[26px] font-semibold text-ink mb-1.5">Enter code</h1>
            <p className="text-sm text-muted mb-6">
              We sent a 6-digit code to <span className="text-ink font-medium">{email}</span>
            </p>

            {devOtp && (
              <div className="text-sm bg-accent-soft border border-accent/30 rounded-lg px-4 py-3 mb-6">
                <p className="font-semibold text-accent mb-1">No mail server is configured (dev mode)</p>
                <p className="text-muted">
                  Your code is{" "}
                  <button
                    type="button"
                    onClick={() => setOtp(devOtp)}
                    className="text-primary font-bold text-base tracking-widest hover:underline"
                  >
                    {devOtp}
                  </button>
                </p>
              </div>
            )}

            <form onSubmit={handleReset} className="flex flex-col gap-[18px]">
              <TextInput
                label="6-digit code"
                inputMode="numeric"
                maxLength={6}
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="123456"
                className="tracking-[0.3em] font-mono text-center"
              />
              <TextInput
                label="New password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={fieldErrors.password}
                hint="At least 8 characters, one uppercase letter, one number"
                placeholder="••••••••"
              />
              <TextInput
                label="Confirm new password"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={fieldErrors.confirmPassword}
                placeholder="••••••••"
              />

              {error && <p className="text-sm text-danger">{error}</p>}

              <Button type="submit" fullWidth isLoading={isSubmitting} className="mt-1.5">
                Reset password
              </Button>

              <button
                type="button"
                onClick={() => setStep("email")}
                className="text-sm text-center text-muted hover:text-ink"
              >
                Use a different email
              </button>
            </form>
          </>
        )}

        {step === "done" && (
          <>
            <h1 className="font-display text-[26px] font-semibold text-ink mb-1.5">Password updated</h1>
            <p className="text-sm text-ink bg-primary-soft rounded-lg px-4 py-3">
              Redirecting you to sign in...
            </p>
          </>
        )}
      </Card>
    </AuthLayout>
  );
}
