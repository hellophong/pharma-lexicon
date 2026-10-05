import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test("search, combined filters, empty state, saved terms, and persistence", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByLabel("Search terms, phrases, or definitions")
    .fill("medical loss");
  await expect(page.locator(".term-card")).toHaveCount(1);
  await expect(page.locator(".term-card")).toContainText("MLR");
  await page.getByRole("button", { name: "Save MLR", exact: true }).click();
  await page.reload();
  await page.locator(".header-saved").click();
  await expect(page.locator(".term-card")).toHaveCount(1);
  await page.getByRole("button", { name: "Clear all filters" }).click();
  await page.getByLabel("Search terms, phrases, or definitions").fill("zzzzzz");
  await expect(page.locator(".empty-state")).toBeVisible();
  await page.getByRole("button", { name: "Reset the lexicon" }).click();
  await page
    .getByRole("button", { name: "Market access", exact: true })
    .click();
  await expect(page.locator(".term-card")).toHaveCount(8);
  await page.getByRole("button", { name: "P", exact: true }).click();
  await expect(page.locator(".term-card")).toHaveCount(4);
});
test("term deep links, related terms, context, and keyboard focus", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("link", { name: /MLR Medical, Legal/ }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Medical Loss Ratio", exact: true }),
  ).toBeVisible();
  await expect(page).toHaveURL(/#term\/mlr/);
  await page.getByRole("button", { name: "PI", exact: true }).click();
  await expect(page).toHaveURL(/#term\/pi/);
  await page.reload();
  await expect(page.getByRole("dialog")).toContainText(
    "Prescribing Information",
  );
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await page.getByRole("link", { name: /MLR Medical, Legal/ }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("link", { name: /MLR Medical, Legal/ }),
  ).toBeFocused();
  await page.goto("/#term/not-real");
  await expect(page.getByRole("dialog")).toContainText(
    "That field note isn’t here.",
  );
});
test("learning sequence completes and persists progress", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Begin onboarding" }).click();
  for (let i = 0; i < 4; i++)
    await page.getByRole("button", { name: "Mark read & continue" }).click();
  await page
    .getByRole("button", { name: "Complete path", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toContainText("PATH COMPLETE");
  await page.keyboard.press("Escape");
  await page.reload();
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("pl:progress:v1")!).length,
    ),
  ).toBe(5);
});
test("suggestion validates and saves a local moderation record", async ({
  page,
}) => {
  await page.goto("/#suggest");
  await page.getByLabel("Acronym *", { exact: true }).fill("TEST");
  await page.getByLabel("Expanded phrase *").fill("Test terminology");
  await page
    .getByLabel("Plain-language definition *")
    .fill("An example proposed term.");
  await page.getByLabel("Example sentence *").fill("Let us clarify TEST.");
  await page
    .getByLabel("Why it matters *")
    .fill("It helps our team understand the brief.");
  await page.getByLabel("Source name or URL *").fill("Team handbook");
  await page.getByRole("button", { name: "Submit for review" }).click();
  await expect(page.getByRole("dialog")).toContainText(
    "local submission queue",
  );
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("pl:suggestions:v1")!)[0].status,
    ),
  ).toBe("submitted");
});
test("responsive layouts, reduced motion, and representative screenshots", async ({
  page,
}) => {
  for (const [name, width, height] of [
    ["desktop", 1440, 1000],
    ["tablet", 820, 1180],
    ["mobile", 390, 844],
  ] as const) {
    await page.setViewportSize({ width, height });
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator("h1")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({ path: `screenshots/${name}.png`, fullPage: true });
  }
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page
    .locator("#lexicon")
    .evaluate((el) =>
      el.scrollIntoView({ block: "start", behavior: "instant" }),
    );
  expect(
    await page
      .locator("html")
      .evaluate((el) => getComputedStyle(el).scrollBehavior),
  ).toBe("auto");
  await page.screenshot({
    path: "screenshots/mobile-reduced-motion.png",
    fullPage: true,
  });
});
test("WCAG AA automated checks for landing and dialog", async ({ page }) => {
  await page.goto("/");
  let result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(result.violations).toEqual([]);
  await page.goto("/#term/mlr");
  result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(result.violations).toEqual([]);
});

test("mobile dialogs remain usable, focus stays contained, and storage failures recover", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/#suggest");
  await page.getByRole("button", { name: "Submit for review" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  expect(
    await page
      .locator("dialog form")
      .evaluate((el) => (el as HTMLFormElement).checkValidity()),
  ).toBe(false);
  for (let i = 0; i < 14; i++) {
    await page.keyboard.press("Tab");
    expect(
      await page.evaluate(() => !!document.activeElement?.closest("dialog")),
    ).toBe(true);
  }
  for (const hash of ["#term/mlr", "#path/first-mlr", "#suggest"]) {
    await page.goto("/" + hash);
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(result.violations).toEqual([]);
    expect(
      await page
        .getByRole("dialog")
        .evaluate((el) => el.scrollWidth <= el.clientWidth),
    ).toBe(true);
  }
  await page.goto("/");
  await page.evaluate(() =>
    localStorage.setItem("pl:bookmarks:v1", "malformed"),
  );
  await page.reload();
  await expect(page.locator("h1")).toBeVisible();
  await expect(page.locator(".saved-count")).toHaveText("0");
});

test("capture presentation frames and check compact viewport overflow", async ({
  page,
}) => {
  for (const width of [320, 768, 1024]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: "screenshots/desktop-overview.png" });
  await page
    .locator("#lexicon")
    .evaluate((el) =>
      el.scrollIntoView({ block: "start", behavior: "instant" }),
    );
  await page.screenshot({ path: "screenshots/desktop-lexicon.png" });
  await page.goto("/#term/mlr");
  await page.screenshot({ path: "screenshots/desktop-field-note.png" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.screenshot({ path: "screenshots/mobile-overview.png" });
  await page
    .locator("#lexicon")
    .evaluate((el) =>
      el.scrollIntoView({ block: "start", behavior: "instant" }),
    );
  await page.screenshot({ path: "screenshots/mobile-lexicon.png" });
});

test("generate code-native social sharing image", async ({ page }) => {
  await page.setViewportSize({ width: 1200, height: 630 });
  await page.goto("/social.svg");
  await page.screenshot({ path: "public/social.png" });
});

test("simplified page starts with the unchanged lexicon and retains contribution and footer", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("main > section")).toHaveCount(2);
  await expect(page.locator("main > section").first()).toHaveAttribute(
    "id",
    "lexicon",
  );
  await expect(page.locator("main > section").last()).toHaveAttribute(
    "id",
    "contribute",
  );
  await expect(
    page.getByRole("navigation").getByText("Learning paths"),
  ).toHaveCount(0);
  await expect(page.locator(".term-card")).toHaveCount(6);
  await page.keyboard.press("/");
  await expect(
    page.getByLabel("Search terms, phrases, or definitions"),
  ).toBeFocused();
  expect(
    await page
      .locator(".footer-surface")
      .evaluate((el) => getComputedStyle(el).backgroundColor),
  ).toBe("rgb(23, 61, 52)");
  await page
    .locator("#contribute")
    .getByRole("button", { name: "Suggest a term" })
    .click();
  await expect(page.getByRole("dialog")).toHaveAccessibleName("Suggest a term");
  await page.keyboard.press("Escape");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Toggle navigation" }).click();
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "Suggest a term" })
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
});
