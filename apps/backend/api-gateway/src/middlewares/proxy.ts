import { getConfig } from "../utils/createConfig";
import express, { Request, Response } from "express";
import { createProxyMiddleware, Options } from "http-proxy-middleware";
import { ClientRequest, IncomingMessage } from "http";
import { ROUTE_PATHS } from "../routeDefs";
import { logger } from "../utils/logger";
interface ProxyConfig {
  [context: string]: Options<IncomingMessage, Response>;
}

declare module "express" {
  interface Request {
    session?: any; // Adjust the type based on your session configuration
  }
}

const currentEnv = process.env.NODE_ENV || "development";
const config = getConfig(currentEnv);
// TODO SERVICES
// 1. auth service
// 2. student service
// 3. teacher student
// 4. user service

// Define the proxy rules and targets
const proxyConfigs: ProxyConfig = {
  [ROUTE_PATHS.AUTH_SERVICE]: {
    target: config.authServiceUrl as string,
    pathRewrite: (path, _req) => {
      logger.info(`pathRewrite: ${path}`);
      return `${ROUTE_PATHS.AUTH_SERVICE}${path}`;
    },
    changeOrigin: true,
    selfHandleResponse: true,
    on: {
      proxyReq: (
        proxyReq: ClientRequest,
        req: IncomingMessage,
        _res: Response
      ) => {
        logger.info(
          `Proxied request url: ${proxyReq.protocol}//${proxyReq.host}${proxyReq.path}`
        );
        logger.info(`Headers Sent: ${JSON.stringify(proxyReq.getHeaders())}`);
      },
      proxyRes: (proxyRes, req, res) => {
        let originalBoby: Buffer[] = [];
        proxyRes.on("data", function (chunk: Buffer) {
          originalBoby.push(chunk);
        });
        proxyRes.on("end", function () {
          const bodyString = Buffer.concat(originalBoby).toString("utf8");
          let responseBody: {
            message?: string;
            Data?: Array<object>;
            token?: string;
            redirectUrl?: string;
            errors?: Array<object>;
            isLogout?: boolean;
          };
          try {
            logger.info(`boby string ${bodyString}`);
            responseBody = JSON.parse(bodyString);
            // If Response Error, Not Modified Response
            if (responseBody.errors) {
              return res.status(proxyRes.statusCode!).json(responseBody);
            }
            // Store JWT in session
            logger.info(`responseBody token: ${responseBody.token}`);
            if (responseBody.token) {
              (req as Request).session!.jwt = responseBody.token;
              res.cookie("persistent", responseBody.token);
              delete responseBody.token;
            }

            if (responseBody.redirectUrl) {
              return res.redirect(responseBody.redirectUrl);
            }
            if (responseBody.isLogout) {
              // Clear the persistent cookie
              logger.info("successfull");
              res.clearCookie("persistent");
              if ((req as Request).session!.jwt) {
                try {
                  // Manually clear the session data
                  (req as Request).session = null;

                  return res.end(); // End response after logout
                } catch (error) {
                  logger.error("Error clearing session:", error);
                  return res
                    .status(500)
                    .json({ message: "Error clearing session" });
                }
              }
            }
            // Modify response to send  the message to the client
            res.json({
              message: responseBody.message,
            });
          } catch (error: unknown) {
            return res.status(500).json({ message: "Error parsing response" });
          }
        });
      },
    },
  },
};

const applyProxy = (app: express.Application) => {
  Object.keys(proxyConfigs).forEach((context: string) => {
    app.use(context, createProxyMiddleware(proxyConfigs[context]));
  });
};
export default applyProxy;
