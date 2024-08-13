import express, { Application, NextFunction, Request, Response } from "express";
import compression from "compression";
import cookieParser from "cookie-parser";
import cookieSession from "cookie-session";
import hpp from "hpp";
import helmet from "helmet";
import { optionKsession } from "./utils/cookieOption";
import cors from "cors";
import coreOption from "./utils/corsOptions";
import applyRateLimit from "./middlewares/applyRateLimit";
import { logger } from "./utils/logger";
import { StatusCode } from "./utils/StatusCode";
import BaseCustomError from "./errors/baseCustomError";
import errorHandler from "./middlewares/errorHandler";
import applyProxy from "./middlewares/proxy";

const app: Application = express();
// Security Middleware
app.set("trust proxy", 1);
app.use(compression());
app.use(cookieParser());

app.use(cookieSession(optionKsession));
// Prevent HTTP Parameter Pollution attacks
app.use(hpp());
// Prevent Some Security:
// - Stops browsers from sharing your site's vistor data
// - Stops your website from being displayed in a frame
// - Prevent XSS, etc.
app.use(helmet());

app.use(cors(coreOption));
// apply Limit Request
applyRateLimit(app);

// Hide Express Server Information
app.disable("x-powered-by");
// ===================
// Proxy Routes
// ===================

applyProxy(app);

// Global Error Handler
app.use("*", (req: Request, res: Response, _next: NextFunction) => {
  const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  logger.error(`${fullUrl} endpoint does not exist`);
  res
    .status(StatusCode.NotFound)
    .json({ message: "The endpoint called does not exist." });
});
// Erorr handlers
app.use(errorHandler);

export default app;
