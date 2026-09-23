"use client";

import { useState } from "react";
import { useAuth } from "@/store/authStore";
import { authService } from "@/services/authService";
import { Button } from "@/components/common/Button";
import { AlertTriangleIcon } from "@/components/icons";

export const VerificationBanner: React.FC = () => {
  const { user } = useAuth();
  const [isSending, setIsSending] = useState(false);
  const [devLink, setDevLink] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  if (!user || user.is_verified) return null;

  const handleResend = async () => {
    setIsSending(true);
    try {
      const res = await authService.resendVerification(user.email);
      setDevLink(res.dev_link);
      setSent(true);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="bg-accent-soft border border-accent/30 rounded-xl px-5 py-4 flex flex-col gap-2">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <AlertTriangleIcon width={18} height={18} className="text-accent shrink-0" />
          <p className="text-sm text-ink">
            <span className="font-semibold">Verify your email</span> to unlock creating products and orders.
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={handleResend} isLoading={isSending}>
          {sent ? "Resend link" : "Send verification link"}
        </Button>
      </div>

      {devLink && (
        <div className="text-sm bg-surface rounded-lg px-4 py-3 mt-1">
          <p className="text-muted mb-1.5">No mail server is configured (dev mode) — here&apos;s the link:</p>
          <a href={devLink} className="text-primary font-semibold break-all hover:underline">
            {devLink}
          </a>
        </div>
      )}
    </div>
  );
};
