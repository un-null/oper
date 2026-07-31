import { expect, test } from "@playwright/test";

import { signIn } from "./helpers/auth";
import { sql } from "./helpers/db";

const uniqueEmail = () => `oper-e2e-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;

test.beforeAll(async () => {
  await sql`DELETE FROM items WHERE title LIKE 'E2E %'`;
  await sql`DELETE FROM "user" WHERE email LIKE 'oper-e2e-%'`;
});

test.afterAll(async () => {
  await sql`DELETE FROM items WHERE title LIKE 'E2E %'`;
  await sql`DELETE FROM "user" WHERE email LIKE 'oper-e2e-%'`;
  await sql.end();
});

test("anonymous visitors can still see the browse list", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  await expect(page.getByRole("link", { name: "Sign in" })).toBeVisible();
});

test("a new user is redirected to onboarding after signing in", async ({ page }) => {
  const email = uniqueEmail();

  await signIn(page, email);

  await expect(page).toHaveURL(/\/onboarding$/);

  await page.getByLabel("Display name").fill("E2E Tester");
  await page.getByRole("button", { name: "Continue" }).click();

  await expect(page).toHaveURL("/");
  await expect(page.getByText("Signed in as")).toBeVisible();
});

test("a posted item can be found on the browse list and viewed on its detail page", async ({
  page,
}) => {
  const email = uniqueEmail();
  const title = `E2E sofa ${Date.now()}`;

  await signIn(page, email);
  await expect(page).toHaveURL(/\/onboarding$/);
  await page.getByLabel("Display name").fill("E2E Poster");
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page).toHaveURL("/");

  await page.goto("/items/new");
  await page.getByLabel("Title").fill(title);
  await page.getByRole("button", { name: "Choose a category" }).click();
  await page.getByRole("option", { name: "Furniture" }).click();
  await page.getByRole("radio", { name: "Good" }).click();
  await page.getByRole("radio", { name: "Dorm lobby — Block C" }).click();
  await page.getByRole("button", { name: "Post for free" }).click();

  await expect(page).toHaveURL("/");
  await expect(page.getByText(title)).toBeVisible();

  await page.getByText(title).click();
  await expect(page.getByRole("heading", { name: title })).toBeVisible();
  await expect(page.getByText(/km away/)).toBeVisible();
});

test("browse filters are reflected in the URL and carried into the detail link", async ({
  page,
}) => {
  await page.goto("/?from=dorm-c&radius=5");

  await expect(page).toHaveURL(/from=dorm-c/);
  await expect(page).toHaveURL(/radius=5/);
});