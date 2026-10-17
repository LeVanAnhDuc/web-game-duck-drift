import { test, expect } from "@/fixtures";

// ADR-0021: the deployed build ships with the Ducker ID flag off - no button, no menu, no storage, no outside request.
// Runs on the "app" project, i.e. the normal (flag-off) export.

test("cờ tắt: không nút đăng nhập, không đọc URL, không sessionStorage, không request ra ngoài", { tag: ["@TC-DUCKERID-001", "@smoke"] }, async ({
  page,
  gamePage,
  baseURL,
}) => {
  const site = new URL(baseURL!).origin;
  const outside: string[] = [];
  page.on("request", (r) => {
    if (new URL(r.url()).origin !== site) outside.push(r.url());
  });
  await gamePage.goto("code=x&state=y");
  await expect(gamePage.menu.play()).toBeVisible();
  await expect(gamePage.account.signIn()).toHaveCount(0);
  await expect(gamePage.account.trigger()).toHaveCount(0);
  expect(await page.evaluate(() => sessionStorage.length)).toBe(0);
  // with the flag off the URL is not read either: a stray ?code= is left exactly where it was
  expect(await page.evaluate(() => window.location.search)).toContain("code=x");
  expect(outside).toEqual([]);
});

test("cờ tắt: cột menu căn giữa, không phải vùng cuộn", { tag: ["@TC-DUCKERID-002"] }, async ({ gamePage }) => {
  await gamePage.goto();
  const style = await gamePage.menu.column().evaluate((el) => {
    const s = getComputedStyle(el);
    return { justify: s.justifyContent, overflowY: s.overflowY };
  });
  expect(style.justify).toBe("center");
  expect(style.overflowY).not.toBe("auto");
});
