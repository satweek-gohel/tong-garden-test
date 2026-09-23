"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/store/authStore";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { TextInput } from "@/components/forms/TextInput";
import { SelectInput } from "@/components/forms/SelectInput";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { validators } from "@/utils/validation";

export default function SignupPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"user" | "admin">("user");
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const emailError = validators.email(email);
    const passwordError = validators.password(password);
    if (emailError || passwordError) {
      setFieldErrors({ email: emailError, password: passwordError });
      return;
    }
    setFieldErrors({});

    setIsSubmitting(true);
    try {
      await register(email, fullName, password, role);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <Card variant="elevated" className="w-full max-w-[400px] p-11 rounded-2xl">
        <h1 className="font-display text-[26px] font-semibold text-ink mb-1.5">Create an account</h1>
        <p className="text-sm text-muted mb-8">Tong Garden Operations</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-[18px]">
          <TextInput
            label="Full name"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Jane Doe"
          />
          <TextInput
            label="Email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={fieldErrors.email}
            placeholder="ops@tonggarden.com"
          />
          <TextInput
            label="Password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={fieldErrors.password}
            hint="At least 8 characters, one uppercase letter, one number"
            placeholder="••••••••"
          />
          <SelectInput
            label="Account type"
            value={role}
            onChange={(e) => setRole(e.target.value as "user" | "admin")}
            options={[
              { value: "user", label: "Team member" },
              { value: "admin", label: "Admin" },
            ]}
          />

          {error && <p className="text-sm text-danger">{error}</p>}

          <Button type="submit" fullWidth isLoading={isSubmitting} className="mt-1.5">
            Create account
          </Button>
        </form>

        <p className="mt-7 text-sm text-center text-muted">
          Already have an account?{" "}
          <Link href="/login" className="text-primary font-semibold hover:text-primary-dark">
            Sign in
          </Link>
        </p>
      </Card>
    </AuthLayout>
  );
}
