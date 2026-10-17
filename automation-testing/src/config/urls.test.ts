import { test, expect } from "@playwright/test";
import { getUrls } from "./urls";
import { getFixedAccount } from "./accounts";

test("dev urls: web and api base", () => {
  expect(getUrls("dev")).toEqual({ webUrl: "http://127.0.0.1:4311", apiUrl: "http://127.0.0.1:4311" });
});

test("fixed account reads env-specific vars", () => {
  const acc = getFixedAccount("stg", { STG_USER_EMAIL: "a@b.c", STG_USER_PASSWORD: "p" });
  expect(acc).toEqual({ email: "a@b.c", password: "p" });
});

test("fixed account names the missing var", () => {
  expect(() => getFixedAccount("dev", { DEV_USER_EMAIL: "a@b.c" })).toThrow(/DEV_USER_PASSWORD/);
});
