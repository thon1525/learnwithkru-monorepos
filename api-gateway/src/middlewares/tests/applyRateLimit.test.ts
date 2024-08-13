import { describe, expect, it, jest, beforeAll, test } from "@jest/globals";
import express from "express";
import rateLimit from "express-rate-limit";
import { getConfig } from "../../utils/createConfig";
import applyRateLimit from "../applyRateLimit";

describe("create applyReteLimit", () => {
  it("should have correct properties ", () => {
    const config = getConfig(process.env.NODE_ENV);
    const isDevelopment = config.env === "development";
    const RATE_LIMIT_WINDOW_MS = isDevelopment
      ? 15 * 60 * 1000
      : 15 * 60 * 1000; // 15 minutes in milliseconds
    const MAX_REQUESTS = isDevelopment ? 10000 : 100; // Higher limit in development for testing
    const applyRateLimitPro = (app: express.Application) => {
      app.use(
        rateLimit({
          windowMs: RATE_LIMIT_WINDOW_MS,
          max: MAX_REQUESTS,
          message:
            "Too many requests from this IP, please try again after 15 minutes",
          headers: true,
        })
      );
      try {
      } catch (error) {}
    };
    expect(applyRateLimit).toEqual("mmmmmmm");
  });
});
