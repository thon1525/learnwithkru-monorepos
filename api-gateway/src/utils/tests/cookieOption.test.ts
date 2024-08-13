import {
  describe,
  expect,
  it,
  jest,
  beforeAll,
  test,
  beforeEach,
} from "@jest/globals";
import { optionKsession } from "../cookieOption";
import { getConfig } from "../createConfig";

// Mock the getConfig function
const config = getConfig(process.env.NODE_ENV);
describe("optionKsession", () => {
  it("should have correct properties", () => {
    const expected: CookieSessionInterfaces.CookieSessionOptions = {
      name: "session",
      keys: [`${config.cookieSecretKeyOne}`, `${config.cookieSecretKeyTwo}`],
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      overwrite: true,
      path: "/",
    };

    expect(optionKsession).toEqual(expected);
  });
});
