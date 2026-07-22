import { Resend } from "resend";

// Lazily construct the client so importing this module never throws when
// RESEND_API_KEY is unset (e.g. the better-auth CLI loading the config, or
// build-time analysis). The key is only required when an email is actually
// sent.
let client: Resend | null = null;

export function getResend(): Resend {
  if (!client) {
    client = new Resend(process.env.RESEND_API_KEY);
  }
  return client;
}

// Verified sender for transactional auth email. Swap the address once a
// custom domain is verified in Resend; until then Resend's onboarding
// sender works for development.
export const AUTH_EMAIL_FROM = "Oper <onboarding@resend.dev>";
