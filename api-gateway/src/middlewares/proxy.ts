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
            data?: Array<object>;
            token?: string;
            redirectUrl?: string;
            errors?: Array<object>;
            isLogout?: boolean;
          };
          try {
            logger.info(`boby string ${bodyString}`);
            responseBody = JSON.parse(bodyString);
            if (responseBody.redirectUrl) {
              return res.status(proxyRes.statusCode!).json(responseBody);
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
