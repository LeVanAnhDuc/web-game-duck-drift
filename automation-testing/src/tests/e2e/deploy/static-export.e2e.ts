import { test, expect } from "@/fixtures";

// Runs unchanged on dev (served at the root) and on prd (GitHub Pages under /web-game-duck-drift/).

test("mở trang và vào ván không có resource nào lỗi", { tag: ["@TC-DEPLOY-001", "@smoke"] }, async ({ page, gamePage }) => {
  const broken: string[] = [];
  page.on("requestfailed", (r) => broken.push(`${r.url()} ${r.failure()?.errorText}`));
  page.on("response", (r) => {
    if (r.status() >= 400) broken.push(`${r.url()} ${r.status()}`);
  });
  await gamePage.goto();
  await gamePage.start();
  await page.waitForLoadState("networkidle");
  expect(broken).toEqual([]);
});

test("mọi request của site nằm dưới base path", { tag: ["@TC-DEPLOY-002", "@smoke"] }, async ({ page, gamePage, baseURL }) => {
  const base = new URL(baseURL!);
  const outside: string[] = [];
  page.on("request", (r) => {
    const url = new URL(r.url());
    if (url.origin === base.origin && !url.pathname.startsWith(base.pathname)) outside.push(r.url());
  });
  await gamePage.goto();
  await gamePage.start();
  await page.waitForLoadState("networkidle");
  expect(outside).toEqual([]);
});
