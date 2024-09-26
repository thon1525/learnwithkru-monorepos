import app from './app';
import { logger, logInit } from '@notification/utils/logger';
import { getConfig } from '@notification/utils/createConfig';
import EmailSender from './utils/EmailSender';
import NodemailerEmailApi from './utils/NodemailerEmailApi';
import { startQueue } from './queues/connection';

async function run() {
  try {
    // currect envaironment
    const currentEnv = process.env.NODE_ENV || 'development';
    const config = getConfig(currentEnv);

    // Initialize Logger
    logInit({ env: process.env.NODE_ENV, logLevel: config.logLevel });

    // start socket server​
    // const socketSender = SocketSender.getInstance();
    // socketSender.activate();
    // socketSender.sendSocketApi(new SocketNotificationEmailApi());
    // Activate Email Sender with Nodemailer API
    const emailSender = EmailSender.getInstance();
    emailSender.activate();
    emailSender.setEmailApi(new NodemailerEmailApi());

    //Start the Queue System (RabbitMQ)
    await startQueue();
    logger.info('RabbitMQ queue system started successfully.');

    logger.info(
      `Worker with process ID ${process.pid} on notification server has started.`
    );

    // Start the Notification Server
    const server = app.listen(config.port, () => {
      logger.info(`Notification Server is listening on port: ${config.port}`);
    });

    const exitHandler = async () => {
      if (server) {
        server.close(() => {
          logger.info('Server closed!');
          process.exit(1); // Exit process due to error
        });
      } else {
        process.exit(1);
      }
    };

    const unexpectedErrorHandler = (error: unknown) => {
      logger.error(`Unhandled error: ${error}`);
      exitHandler();
    };

    // Handle uncaught exceptions and unhandled promise rejections
    process.on('uncaughtException', unexpectedErrorHandler); // Synchronous errors
    process.on('unhandledRejection', unexpectedErrorHandler); // Asynchronous errors

    // Handle termination signals (e.g., from Docker or Kubernetes)
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received');
      if (server) {
        server.close(() => {
          logger.info('Stopped accepting new requests');
        });
      }
    });
  } catch (error) {
    logger.error(`Failed to initialize application: ${error}`);
    process.exit(1);
  }
}

// Only run
if (process.env.NODE_ENV !== 'testing') {
  run();
}
