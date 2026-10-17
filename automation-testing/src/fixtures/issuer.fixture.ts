import type { Page } from "@playwright/test";
import { DUCKER } from "@/data/test-data";
import { test as core } from "./core.fixture";

export type IssuerMode = "ok" | "deny" | "tamper" | "hang";

export interface FakeIssuer {
  /** How many times the browser was sent to /oauth/authorize. */
  authorizeCalls(): number;
  /** How many times the token endpoint was called. */
  tokenCalls(): number;
}

const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "authorization, content-type",
};

/**
 * Plays Ducker ID for the flag-on export: /oauth/authorize redirects straight back (with a code, an error, or a
 * tampered state), /oauth/token and /oauth/userinfo answer - or, in "hang", never answer.
 */
async function install(page: Page, mode: IssuerMode): Promise<FakeIssuer> {
  let authorizeCalls = 0;
  let tokenCalls = 0;
  await page.route(`${DUCKER.issuer}/oauth/authorize**`, async (route) => {
    authorizeCalls += 1;
    const url = new URL(route.request().url());
    const back = new URL(url.searchParams.get("redirect_uri")!);
    if (mode === "deny") back.searchParams.set("error", "access_denied");
    else back.searchParams.set("code", "code-1");
    back.searchParams.set("state", mode === "tamper" ? "tampered" : url.searchParams.get("state")!);
    await route.fulfill({ status: 302, headers: { location: back.toString() } });
  });
  await page.route(`${DUCKER.issuer}/oauth/token`, async (route) => {
    tokenCalls += 1;
    if (mode === "hang") return; // never answered: the client's own timeout has to end it
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      headers: CORS,
      body: JSON.stringify({ access_token: "at-1", token_type: "Bearer", expires_in: 900 }),
    });
  });
  await page.route(`${DUCKER.issuer}/oauth/userinfo`, (route) =>
    route.fulfill({ status: 200, contentType: "application/json", headers: CORS, body: JSON.stringify(DUCKER.user) }),
  );
  return { authorizeCalls: () => authorizeCalls, tokenCalls: () => tokenCalls };
}

export const test = core.extend<{ fakeIssuer: (mode?: IssuerMode) => Promise<FakeIssuer> }>({
  fakeIssuer: async ({ page }, use) => use((mode = "ok") => install(page, mode)),
});
