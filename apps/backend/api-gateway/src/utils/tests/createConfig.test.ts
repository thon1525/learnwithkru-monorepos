import { describe, expect, it, jest, beforeAll, test } from "@jest/globals";
import { getConfig } from "../createConfig";
import path from "path";
import dotenv from "dotenv";

// jest.mock("dotenv");
describe("create env this config", () => {
  beforeAll(() => {
    // Load environment variables manually for testing
    dotenv.config({ path: path.join(__dirname, "../../configs/.env") });
  });
  it("should load development configuration", () => {
    process.env.NODE_ENV = "development";
    const config = getConfig(process.env.NODE_ENV);
    expect(config.port).toBe("3000");
    expect(config.cookieSecretKeyOne).toBe("48a9c9a7bd58fff6a243d45fdf5dc31b");
    expect(config.cookieSecretKeyTwo).toBe("9309de3ec71d5c4920b855d0ceb3b477");
  });
  test("should load production configuration", () => {
    dotenv.config({
      path: path.join(__dirname, "../../configs/.env.production"),
    });

    process.env.NODE_ENV = "production";
    const config = getConfig(process.env.NODE_ENV);
    expect(config.env).toBe("production");
  });
});
