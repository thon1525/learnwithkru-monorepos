import {
  describe,
  expect,
  it,
  jest,
  beforeAll,
  test,
  beforeEach,
} from "@jest/globals";
import { getConfig } from "../createConfig";
import coreOption from "../corsOptions";

const config = getConfig(process.env.NODE_ENV);
describe("create coreOption", () => {
  it("should have correct properties ", () => {
    const coreOptionPro = {
      origin:
        config.env === "development"
          ? "http://localhost:8000"
          : config.clientUrl,
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    };
    expect(coreOption).toEqual(coreOptionPro);
  });
});
