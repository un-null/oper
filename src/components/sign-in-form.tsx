"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { authClient } from "@/lib/auth-client";

const RESEND_COOLDOWN_MS = 60_000;

function mapAuthError(code: string | undefined): string {
  switch (code) {
    case "OTP_EXPIRED":
      return "That code expired. Request a new one.";
    case "INVALID_OTP":
      return "That code doesn't look right. Check it and try again.";
    case "TOO_MANY_ATTEMPTS":
      return "Too many attempts. Wait a bit and request a new code.";
    default:
      return "Something went wrong. Please try again.";
  }
}

const inputClass =
  "rounded-md border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/30 disabled:opacity-50 dark:border-white/15 dark:focus:border-white/30";
const submitClass =
  "rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background disabled:cursor-not-allowed disabled:opacity-50";

type EmailStepProps = {
  email: string;
  onEmailChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isPending: boolean;
  error: string | null;
};

function EmailStep({ email, onEmailChange, onSubmit, isPending, error }: EmailStepProps) {
  return (
    <form className="flex flex-col gap-4" onSubmit={onSubmit}>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium" htmlFor="email">
          Student email
        </label>
        <input
          autoComplete="email"
          className={inputClass}
          disabled={isPending}
          id="email"
          onChange={(e) => onEmailChange(e.target.value)}
          placeholder="you@university.edu"
          required
          type="email"
          value={email}
        />
      </div>
      {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}
      <button className={submitClass} disabled={isPending || !email} type="submit">
        {isPending ? "Sending…" : "Send code"}
      </button>
    </form>
  );
}

type OtpStepProps = {
  email: string;
  otp: string;
  onOtpChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onChangeEmail: () => void;
  onResend: () => void;
  isPending: boolean;
  error: string | null;
  cooldownRemaining: number;
};

function OtpStep({
  email,
  otp,
  onOtpChange,
  onSubmit,
  onChangeEmail,
  onResend,
  isPending,
  error,
  cooldownRemaining,
}: OtpStepProps) {
  return (
    <form className="flex flex-col gap-4" onSubmit={onSubmit}>
      <p className="text-sm text-foreground/70">
        Code sent to <span className="font-medium text-foreground">{email}</span>
      </p>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium" htmlFor="otp">
          Verification code
        </label>
        <input
          autoComplete="one-time-code"
          className={`${inputClass} tracking-widest`}
          disabled={isPending}
          id="otp"
          inputMode="numeric"
          maxLength={6}
          onChange={(e) => onOtpChange(e.target.value.replace(/\D/g, ""))}
          pattern="[0-9]*"
          placeholder="123456"
          required
          type="text"
          value={otp}
        />
      </div>
      {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}
      <button className={submitClass} disabled={isPending || otp.length < 6} type="submit">
        {isPending ? "Verifying…" : "Verify"}
      </button>
      <div className="flex items-center justify-between text-sm">
        <button
          className="text-foreground/70 underline-offset-2 hover:underline disabled:opacity-50"
          disabled={isPending}
          onClick={onChangeEmail}
          type="button"
        >
          Change email
        </button>
        <button
          className="text-foreground/70 underline-offset-2 hover:underline disabled:opacity-50"
          disabled={isPending || cooldownRemaining > 0}
          onClick={onResend}
          type="button"
        >
          {cooldownRemaining > 0 ? `Resend code (${cooldownRemaining}s)` : "Resend code"}
        </button>
      </div>
    </form>
  );
}

export function SignInForm() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldownUntil, setCooldownUntil] = useState<number | null>(null);
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!cooldownUntil) return;
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [cooldownUntil]);

  const cooldownRemaining = cooldownUntil
    ? Math.max(0, Math.ceil((cooldownUntil - Date.now()) / 1000))
    : 0;

  async function sendOtp() {
    setIsPending(true);
    setError(null);
    const { error: sendError } = await authClient.emailOtp.sendVerificationOtp({
      email,
      type: "sign-in",
    });
    setIsPending(false);
    if (sendError) {
      setError(mapAuthError(sendError.code));
      return;
    }
    setStep("otp");
    setCooldownUntil(Date.now() + RESEND_COOLDOWN_MS);
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    await sendOtp();
  }

  async function handleOtpSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsPending(true);
    setError(null);
    const { error: verifyError } = await authClient.signIn.emailOtp({ email, otp });
    setIsPending(false);
    if (verifyError) {
      setError(mapAuthError(verifyError.code));
      return;
    }
    router.push("/");
  }

  function handleChangeEmail() {
    setStep("email");
    setOtp("");
    setError(null);
    setCooldownUntil(null);
  }

  if (step === "email") {
    return (
      <EmailStep
        email={email}
        error={error}
        isPending={isPending}
        onEmailChange={setEmail}
        onSubmit={handleEmailSubmit}
      />
    );
  }

  return (
    <OtpStep
      cooldownRemaining={cooldownRemaining}
      email={email}
      error={error}
      isPending={isPending}
      onChangeEmail={handleChangeEmail}
      onOtpChange={setOtp}
      onResend={sendOtp}
      onSubmit={handleOtpSubmit}
      otp={otp}
    />
  );
}
