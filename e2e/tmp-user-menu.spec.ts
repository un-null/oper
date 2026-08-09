import { expect, test } from "@playwright/test";

import { signIn } from "./helpers/auth";
import { sql } from "./helpers/db";

const email = `oper-e2e-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;

test.afterAll(async () => {
  await sql`DELETE FROM "user" WHERE email LIKE 'oper-e2e-%'`;
});

test("avatar dropdown opens and navigates client-side", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await signIn(page, email);
  await page.getByLabel("Display name").fill("Keita K");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.waitForURL("/");

  const trigger = page.getByRole("button", { name: /Account menu for/ });
  await expect(trigger).toBeVisible();

  // The bug: a plain <button> got no ARIA wiring from MenuTrigger.
  await expect(trigger).toHaveAttribute("aria-haspopup", /menu|true/);
  await expect(trigger).toHaveAttribute("aria-expanded", "false");

  await trigger.click();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");

  const menu = page.getByRole("menu");
  await expect(menu).toBeVisible();
  for (const name of ["My items", "Messages", "Settings", "Sign out"]) {
    await expect(menu.getByRole("menuitem", { name })).toBeVisible();
  }

  // Esc closes
  await page.keyboard.press("Escape");
  await expect(menu).toBeHidden();

  // Keyboard opens
  await trigger.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("menu")).toBeVisible();

  // Client-side navigation: no full reload.
  await page.evaluate(() => {
    (window as unknown as { __noReload: boolean }).__noReload = true;
  });
  await page.getByRole("menuitem", { name: "Settings" }).click();
  await page.waitForURL("/settings");
  const survived = await page.evaluate(
    () => (window as unknown as { __noReload?: boolean }).__noReload === true,
  );
  expect(survived, "expected client-side nav (window state preserved)").toBe(true);

  await expect(page.getByRole("heading", { level: 1, name: "Settings" })).toBeVisible();
  await expect(page.getByText("Update how neighbors see you.")).toHaveCount(0);
  await expect(page.getByText("Choose how Oper looks on this device.")).toHaveCount(0);
});
