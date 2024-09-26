import { app } from './app';
import MongoDBConnector from './database';
import { getConfig } from './utils/createConfig';

import { logger, logInit } from './utils/logger';

async function initializeDatabase(mongoUrl: string) {
  const mongodb = MongoDBConnector.getInstance();
  await mongodb.connect({ url: mongoUrl });
  return mongodb;
}
async function startServer(port: number) {
  return app.listen(port, () => {
    logger.info(`Server is running on port ${port}`);
  });
}

async function run() {
  let server: ReturnType<typeof app.listen> | null = null;
  let mongodb: MongoDBConnector | null = null;
  try {
    const currentEnv = process.env.NODE_ENV || 'development';
    const config = getConfig(currentEnv);
    mongodb = await initializeDatabase(config.mongoUrl!);
    server = await startServer(parseInt(config.port!));
    // Initialize logger
    logInit({ env: process.env.NODE_ENV, logLevel: process.env.LOG_LEVEL });
    const exitHandler = async () => {
      if (server) {
        server.close(async () => {
          logger.info('Server closed.');
          if (mongodb) await mongodb.disconnect();
          logger.info('MongoDB disconnected.');
          process.exit(1); // terminate the process due to error
        });
      } else {
        if (mongodb) await mongodb.disconnect();
        logger.info('MongoDB disconnected.');
        process.exit(1);
      }
    };
    const unexpectedErrorHandler = (error: unknown) => {
      logger.info('Unhandled error:', error);
      exitHandler();
    };

    process.on('uncaughtException', unexpectedErrorHandler);
    process.on('unhandledRejection', unexpectedErrorHandler);
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received');
      if (server) server.close();
    });
  } catch (error: unknown) {
    if (mongodb) {
      await mongodb.disconnect();
      process.exit(1);
    }
  }
}

run();
