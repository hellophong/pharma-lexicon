import { test, expect } from "@playwright/test";

test("deployed assets, direct term links, and main interactions", async ({
  page,
  baseURL,
}) => {
  const failures: string[] = [];
  page.on("pageerror", (error) => failures.push(error.message));
  page.on("response", (response) => {
    if (response.status() >= 400)
      failures.push(`${response.status()} ${response.url()}`);
  });
  const response = await page.goto(baseURL!);
  expect(response?.status()).toBe(200);
  await expect(
    page.getByRole("heading", { name: "The lexicon." }),
  ).toBeVisible();
  await expect(page.getByText("01 / YOUR EVERYDAY REFERENCE")).toBeVisible();
  await expect(page.getByText("02 / BETTER TOGETHER")).toBeVisible();
  await expect(page.locator(".site-header .brand")).toHaveText("pharmalexicon");
  const mask = await page
    .locator(".site-header .brand-mark")
    .evaluate((el) => getComputedStyle(el).maskImage);
  expect(mask).toContain("/pharma-lexicon/brand/pharma-lexicon-symbol.png");
  for (const file of ["brand/pharma-lexicon-symbol.png", "social.png"]) {
    expect((await page.request.get(new URL(file, baseURL).href)).status()).toBe(
      200,
    );
  }
  await page
    .getByLabel("Search terms, phrases, or definitions")
    .fill("medical loss");
  await expect(page.locator(".term-card")).toHaveCount(1);
  await page.getByRole("button", { name: "Save MLR", exact: true }).click();
  await page.reload();
  await page.locator(".header-saved").click();
  await expect(page.locator(".term-card")).toHaveCount(1);
  await page.goto(`${baseURL}#term/mlr`);
  await expect(page.getByRole("dialog")).toContainText("Medical Loss Ratio");
  await page.getByRole("button", { name: "PI", exact: true }).click();
  await expect(page).toHaveURL(`${baseURL}#term/pi`);
  await page.reload();
  await expect(page.getByRole("dialog")).toContainText(
    "Prescribing Information",
  );
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Begin onboarding" }).click();
  await expect(page.getByRole("dialog")).toContainText("Your First MLR Review");
  await page.keyboard.press("Escape");
  await page
    .locator("#contribute")
    .getByRole("button", { name: "Suggest a term" })
    .click();
  await expect(page.getByRole("dialog")).toHaveAccessibleName("Suggest a term");
  expect(failures).toEqual([]);
});

test("public mobile view has no horizontal overflow", async ({
  page,
  baseURL,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(baseURL!);
  await expect(
    page.getByLabel("Search terms, phrases, or definitions"),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Toggle navigation" }).click();
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "Suggest a term" })
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  expect(
    await page
      .getByRole("dialog")
      .evaluate((el) => el.scrollWidth <= el.clientWidth),
  ).toBe(true);
});
