import type { Page } from "@playwright/test";

import { sql } from "./db";

async function readLatestOtp(email: string): Promise<string> {
  for (let attempt = 0; attempt < 20; attempt++) {
    const rows = await sql<{ value: string }[]>`
      SELECT value FROM verification
      WHERE identifier = ${`sign-in-otp-${email}`}
      ORDER BY created_at DESC
      LIMIT 1
    `;
    if (rows[0]) {
      return rows[0].value.split(":")[0];
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`No OTP found for ${email} after waiting`);
}

export async function signIn(page: Page, email: string): Promise<void> {
  await page.goto("/sign-in");
  await page.getByLabel("Student email").fill(email);
  await page.getByRole("button", { name: "Send code" }).click();

  const otp = await readLatestOtp(email);
  await page.getByLabel("Verification code").fill(otp);
  await page.getByRole("button", { name: "Verify" }).click();
}