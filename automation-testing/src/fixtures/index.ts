import { expect, mergeTests } from "@playwright/test";
import { test as accountsTest } from "./accounts.fixture";
import { test as issuerTest } from "./issuer.fixture";
import { test as pagesTest } from "./pages.fixture";

// The only `test` / `expect` specs import. Each fixture file owns one concern and extends core:
//   core      env (worker), urls, guard (auto: blocks @creates-data on prd)
//   accounts  account
//   pages     page objects
//   issuer    fakeIssuer: a stand-in Ducker ID for the flag-on export
// A new concern (api client, mail inbox, rate gate…) gets its own *.fixture.ts and joins mergeTests here.
export const test = mergeTests(accountsTest, pagesTest, issuerTest);
export { expect };
