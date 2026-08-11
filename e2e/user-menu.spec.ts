import { expect, test } from "@playwright/test";

import { signIn } from "./helpers/auth";
import { sql } from "./helpers/db";

const email = `oper-e2e-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;

test.afterAll(async () => {
  await sql`DELETE FROM "user" WHERE email LIKE 'oper-e2e-%'`;
});

test("header display name updates immediately after onboarding and rename, dropdown works", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await signIn(page, email);
  await page.getByLabel("Display name").fill("Keita K");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.waitForURL("/");

  const trigger = page.getByRole("button", { name: /Account menu for/ });
  await expect(trigger).toBeVisible();

  // No reload here — this is exactly the state that was broken before refresh().
  await expect(trigger).toHaveAttribute("aria-label", "Account menu for Keita K");
  await expect(trigger).toHaveAttribute("aria-haspopup", /menu|true/);
  await expect(trigger).toHaveAttribute("aria-expanded", "false");

  await trigger.click();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");

  const menu = page.getByRole("menu");
  await expect(menu).toBeVisible();
  for (const name of ["My items", "Messages", "Settings", "Sign out"]) {
    await expect(menu.getByRole("menuitem", { name })).toBeVisible();
  }

  await page.keyboard.press("Escape");
  await expect(menu).toBeHidden();

  await trigger.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("menu")).toBeVisible();

  await page.evaluate(() => {
    (window as unknown as { __noReload: boolean }).__noReload = true;
  });
  await page.getByRole("menuitem", { name: "Settings" }).click();
  await page.waitForURL("/settings");
  const survivedNav = await page.evaluate(
    () => (window as unknown as { __noReload?: boolean }).__noReload === true,
  );
  expect(survivedNav, "expected client-side nav (window state preserved)").toBe(true);

  await expect(page.getByRole("heading", { level: 1, name: "Settings" })).toBeVisible();
  await expect(page.getByText("Update how neighbors see you.")).toHaveCount(0);
  await expect(page.getByText("Choose how Oper looks on this device.")).toHaveCount(0);

  // Rename in settings; header must update without a reload.
  await page.evaluate(() => {
    (window as unknown as { __noReloadRename: boolean }).__noReloadRename = true;
  });
  await page.getByLabel("Display name").fill("Keita Renamed");
  await page.getByRole("button", { name: "Save" }).click();
  await page.waitForURL("/settings");

  const survivedRename = await page.evaluate(
    () => (window as unknown as { __noReloadRename?: boolean }).__noReloadRename === true,
  );
  expect(survivedRename, "expected client-side nav after rename (window state preserved)").toBe(
    true,
  );
  await expect(page.getByRole("button", { name: "Account menu for Keita Renamed" })).toBeVisible();
});
