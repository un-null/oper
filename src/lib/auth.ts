import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { emailOTP } from "better-auth/plugins";

import { db, schema } from "@/db";
import { AUTH_EMAIL_FROM, getResend } from "@/lib/resend";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  advanced: {
    database: {
      generateId: false,
    },
  },
  plugins: [
    emailOTP({
      async sendVerificationOTP({ email, otp }) {
        await getResend().emails.send({
          from: AUTH_EMAIL_FROM,
          to: email,
          subject: "Your Oper login code",
          text: `Your login code is: ${otp}\n\nThis code is valid for 5 minutes. If you didn't request it, you can ignore this email.`,
        });
      },
    }),
    nextCookies(),
  ],
});
