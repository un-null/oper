import { expect, test } from "@playwright/test";

import { signIn } from "./helpers/auth";
import { sql } from "./helpers/db";

const uniqueEmail = () =>
  `oper-e2e-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;

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
  await page.goto("/");
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
  await page.getByText("Good", { exact: true }).click();
  await page.getByText("Dorm lobby — Block C", { exact: true }).click();
  await page.getByRole("button", { name: "Post for free" }).click();

  await expect(page).toHaveURL("/");
  await expect(page.getByText(title)).toBeVisible();

  await page.getByText(title).click();
  const heading = page.getByRole("heading", { name: title });
  await expect(heading).toBeVisible();
  const detailMain = page.getByRole("main");
  await expect(detailMain.getByText(/km away/).first()).toBeVisible();
});

test("browse filters are reflected in the URL and carried into the detail link", async ({
  page,
}) => {
  await page.goto("/?from=dorm-c&radius=5");

  await expect(page).toHaveURL(/from=dorm-c/);
  await expect(page).toHaveURL(/radius=5/);
});

test("a receiver can message a giver and the giver sees the reply without reloading", async ({
  browser,
}, testInfo) => {
  testInfo.setTimeout(60_000);

  const giverEmail = uniqueEmail();
  const receiverEmail = uniqueEmail();
  const title = `E2E lamp ${Date.now()}`;

  const giverContext = await browser.newContext();
  const giverPage = await giverContext.newPage();
  await signIn(giverPage, giverEmail);
  await expect(giverPage).toHaveURL(/\/onboarding$/);
  await giverPage.getByLabel("Display name").fill("E2E Giver");
  await giverPage.getByRole("button", { name: "Continue" }).click();
  await expect(giverPage).toHaveURL("/");

  await giverPage.goto("/items/new");
  await giverPage.getByLabel("Title").fill(title);
  await giverPage.getByRole("button", { name: "Choose a category" }).click();
  await giverPage.getByRole("option", { name: "Electronics" }).click();
  await giverPage.getByText("Good", { exact: true }).click();
  await giverPage.getByText("Dorm lobby — Block C", { exact: true }).click();
  await giverPage.getByRole("button", { name: "Post for free" }).click();
  await expect(giverPage).toHaveURL("/");

  const receiverContext = await browser.newContext();
  const receiverPage = await receiverContext.newPage();
  await signIn(receiverPage, receiverEmail);
  await expect(receiverPage).toHaveURL(/\/onboarding$/);
  await receiverPage.getByLabel("Display name").fill("E2E Receiver");
  await receiverPage.getByRole("button", { name: "Continue" }).click();
  await expect(receiverPage).toHaveURL("/");

  await receiverPage.goto("/");
  await receiverPage.getByText(title).click();
  await receiverPage.getByRole("button", { name: "Message giver" }).click();
  await expect(receiverPage).toHaveURL(/\/messages\//, { timeout: 15_000 });

  await receiverPage.getByRole("textbox", { name: "Message" }).fill("Is this still available?");
  await receiverPage.getByRole("button", { name: "Send" }).click();
  await expect(receiverPage.getByText("Is this still available?")).toBeVisible();

  await giverPage.goto("/messages");
  await giverPage.getByText(title).click();
  await expect(giverPage.getByText("Is this still available?")).toBeVisible();

  await giverPage.getByRole("textbox", { name: "Message" }).fill("Yes, come by anytime!");
  await giverPage.getByRole("button", { name: "Send" }).click();
  await expect(giverPage.getByText("Yes, come by anytime!")).toBeVisible();

  await expect(receiverPage.getByText("Yes, come by anytime!")).toBeVisible({ timeout: 15_000 });

  await receiverPage.getByRole("spinbutton", { name: /^month/ }).click();
  await receiverPage.keyboard.type("01");
  await receiverPage.keyboard.type("01");
  await receiverPage.keyboard.type("2099");

  await receiverPage.getByRole("spinbutton", { name: /^hour/ }).click();
  await receiverPage.keyboard.type("0230PM");

  await receiverPage.getByLabel("Pickup spot").fill("Dorm lobby — Block C");
  await receiverPage.getByRole("button", { name: "Propose pickup" }).click();
  await expect(receiverPage.getByText(/Waiting for .* to confirm/)).toBeVisible();

  await expect(giverPage.getByRole("button", { name: "Confirm" })).toBeVisible({
    timeout: 15_000,
  });
  await giverPage.getByRole("button", { name: "Confirm" }).click();
  await expect(giverPage.getByText(/^Confirmed for/)).toBeVisible();

  await expect(giverPage.getByText("pending", { exact: true })).toBeVisible();

  await giverPage.getByRole("button", { name: "Mark as picked up" }).click();
  await expect(giverPage.getByText("given", { exact: true })).toBeVisible();

  await expect(giverPage.getByRole("button", { name: "Submit rating" })).toBeVisible();
  await giverPage.getByText("5 stars", { exact: true }).click();
  await giverPage.getByRole("button", { name: "Submit rating" }).click();
  await expect(giverPage.getByRole("button", { name: "Submit rating" })).toBeHidden();

  await expect(receiverPage.getByRole("button", { name: "Submit rating" })).toBeVisible({
    timeout: 15_000,
  });
  await receiverPage.getByText("5 stars", { exact: true }).click();
  await receiverPage.getByRole("button", { name: "Submit rating" }).click();
  await expect(receiverPage.getByRole("button", { name: "Submit rating" })).toBeHidden();

  await giverPage.goto("/items");
  await giverPage.getByText(title).click();
  await expect(giverPage.getByLabel("5.0 out of 5")).toBeVisible();

  await giverContext.close();
  await receiverContext.close();
});
