import { expect, test } from "@playwright/test";

import { sql } from "./helpers/db";

test.afterAll(async () => {
  await sql`DELETE FROM items WHERE title LIKE 'E2E Guest %'`;
  await sql`DELETE FROM "user" WHERE email LIKE 'temp@%'`;
});

test("guest sign-in reaches browse without onboarding, header shows guest name", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/sign-in");

  await page.getByRole("button", { name: "Continue as guest" }).click();
  await page.waitForURL("/");

  await expect(page.getByRole("button", { name: /Account menu for Guest/ })).toBeVisible();

  await page.getByRole("button", { name: /Account menu for Guest/ }).click();
  await expect(page.getByRole("menuitem", { name: "Sign out" })).toBeVisible();
});

test("guest has full permissions and can post an item", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/sign-in");
  await page.getByRole("button", { name: "Continue as guest" }).click();
  await page.waitForURL("/");

  await page.goto("/items/new");
  const title = `E2E Guest Item ${Date.now()}`;
  await page.getByLabel("Title").fill(title);
  await page.getByRole("button", { name: "Choose a category" }).click();
  await page.getByRole("option", { name: "Furniture" }).click();
  await page.getByText("Good", { exact: true }).click();
  await page.getByText("UGM Central Library", { exact: true }).click();
  await page.getByRole("button", { name: "Post for free" }).click();

  await expect(page).toHaveURL("/");
  await expect(page.getByText(title)).toBeVisible();
});
