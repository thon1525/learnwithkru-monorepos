import app from "./app";
import { getConfig } from "./utils/createConfig";
import { logger, logInit } from "./utils/logger";
// RUN THE SERVER GATEWAY
async function Run() {
  try {
    const config = getConfig(process.env.NODE_ENV);
    // active logger
    // Initialize logger
    logInit({ env: process.env.NODE_ENV, logLevel: process.env.LOG_LEVEL });
    // Start Server
    logger.info(`Gateway server has started with process id ${process.pid}`);

    const server = app.listen(config.port, () => {
      logger.info(`Gateway server is listening on port: ${config.port}`);
    });
    const exitHandler = async () => {
      if (server) {
        server.close(async () => {
          logger.info("server closed!");
          logger.info("mongodb disconnected!");

          // Gracefully Terminate
          process.exit(1); // terminate the process due to error
        });
      } else {
        // Gracefully Terminate
        process.exit(1); // terminate the process due to error
      }
    };
    const unexpectedErrorHandler = (error: unknown) => {
      logger.error("unhandled error", { error });
      exitHandler();
    };

    // Error that might occur duing execution that not caught by any try/catch blocks
    process.on("uncaughtException", unexpectedErrorHandler); // Syncronous
    process.on("unhandledRejection", unexpectedErrorHandler); // Asyncronous
    process.on("SIGTERM", () => {
      logger.info("SIGTERM received");
      if (server) {
        // Stop the server from accepting new request but keeps existing connection open until all ongoin request are done
        server.close();
      }
    });
  } catch (error: unknown) {
    logger.error("Gateway Service Failed", { error });
    process.exit(1);
  }
}
// start the server gateway
Run();
