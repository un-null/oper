"use client";

import {
  Button,
  FieldError,
  Form,
  Input,
  InputOTP,
  Label,
  Spinner,
  TextField,
} from "@heroui/react";
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

type EmailStepProps = {
  email: string;
  onEmailChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isPending: boolean;
  error: string | null;
};

function EmailStep({ email, onEmailChange, onSubmit, isPending, error }: EmailStepProps) {
  return (
    <Form className="flex flex-col gap-4" onSubmit={onSubmit}>
      <TextField
        isDisabled={isPending}
        isRequired
        name="email"
        onChange={onEmailChange}
        type="email"
        value={email}
      >
        <Label>Student email</Label>
        <Input autoComplete="email" placeholder="you@university.edu" />
        <FieldError />
      </TextField>
      {error ? <p className="text-danger text-sm">{error}</p> : null}
      <Button isDisabled={!email} isPending={isPending} type="submit">
        {({ isPending: pending }) => (
          <>
            {pending ? <Spinner color="current" size="sm" /> : null}
            {pending ? "Sending…" : "Send code"}
          </>
        )}
      </Button>
    </Form>
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
    <Form className="flex flex-col gap-4" onSubmit={onSubmit}>
      <p className="text-muted text-sm">
        Code sent to <span className="text-foreground font-medium">{email}</span>
      </p>
      <div className="flex flex-col gap-1.5">
        <Label>Verification code</Label>
        <InputOTP isDisabled={isPending} maxLength={6} onChange={onOtpChange} value={otp}>
          <InputOTP.Group>
            <InputOTP.Slot index={0} />
            <InputOTP.Slot index={1} />
            <InputOTP.Slot index={2} />
          </InputOTP.Group>
          <InputOTP.Separator />
          <InputOTP.Group>
            <InputOTP.Slot index={3} />
            <InputOTP.Slot index={4} />
            <InputOTP.Slot index={5} />
          </InputOTP.Group>
        </InputOTP>
      </div>
      {error ? <p className="text-danger text-sm">{error}</p> : null}
      <Button isDisabled={otp.length < 6} isPending={isPending} type="submit">
        {({ isPending: pending }) => (
          <>
            {pending ? <Spinner color="current" size="sm" /> : null}
            {pending ? "Verifying…" : "Verify"}
          </>
        )}
      </Button>
      <div className="flex items-center justify-between text-sm">
        <Button isDisabled={isPending} onPress={onChangeEmail} variant="ghost">
          Change email
        </Button>
        <Button isDisabled={isPending || cooldownRemaining > 0} onPress={onResend} variant="ghost">
          {cooldownRemaining > 0 ? `Resend code (${cooldownRemaining}s)` : "Resend code"}
        </Button>
      </div>
    </Form>
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
