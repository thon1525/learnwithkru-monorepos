import { Logger } from '@nestjs/common';

function configureLogger(app, environment: string) {
  if (environment === 'development') {
    Logger.log('Running in development mode');
    app.useLogger(['log', 'error', 'warn', 'debug', 'verbose']);
  } else if (environment === 'production') {
    Logger.log('Running in production mode');
    app.useLogger(['log', 'error', 'warn']);
  }
}

export default configureLogger;
