import { INestApplication, Logger } from '@nestjs/common';

export function setupGracefulShutdown(app: INestApplication) {
  const server = app.getHttpServer();

  const exitHandler = async () => {
    if (server) {
      server.close(async () => {
        Logger.log('Server closed!');
        Logger.log('MongoDB disconnected!');
        process.exit(1); // Exit process due to error or shutdown signal
      });
    } else {
      process.exit(1);
    }
  };

  process.on('SIGTERM', () => {
    Logger.log('SIGTERM received');
    if (server) {
      server.close();
    }
  });

  // Error handler for uncaught exceptions and unhandled rejections
  process.on('uncaughtException', (error: Error) => {
    Logger.error('Uncaught Exception', error.stack);
    exitHandler();
  });

  process.on('unhandledRejection', (reason: unknown) => {
    Logger.error('Unhandled Rejection', reason);
    exitHandler();
  });
}
