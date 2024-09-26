import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import * as compression from 'compression';
import { Logger } from '@nestjs/common';

import { AppModule } from './app.module';
import configureLogger from './utils/configureLogger';
import setupSwagger from './utils/setupSwagger';
import { setupGracefulShutdown } from './utils/gracefulShutdown';
import { HttpExceptionFilter } from './errors/httpExceptionFilter';
import { LoggerMiddleware } from './middlewares/LoggerMiddleware';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
declare const module: any;
async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);

    const environment = configService.get<string>('NODE_ENV', 'development');
    const port = configService.get<number>('PORT');
    const API_GATEWAY = configService.get<string>('API_GATEWAY');
    // Enable CORS with specific options
    const corsOptions: CorsOptions = {
      origin: API_GATEWAY || 'http://localhost:3000',
      methods: ['GET', 'PUT', 'PATCH', 'POST', 'DELETE'],
      credentials: true,
    };
    app.enableCors(corsOptions);
    // Enable security headers using Helmet
    app.use(helmet());

    // Enable compression for responses
    app.use(compression());
    // Custom logger configuration
    //  configureLogger(app, environment);
    app.useLogger(
      environment === 'development'
        ? ['log', 'error', 'warn', 'debug'] // Detailed logging in development
        : ['log', 'error', 'warn'], // Reduced logging in production
    );
    // Swagger setup for API documentation
    if (environment !== 'production') {
      setupSwagger(app);
    }
    // Start listening on the specified port

    await app.listen(port);
    Logger.log(`Application is running on: ${await app.getUrl()}`);
    // Hot Module Replacement
    if (module.hot) {
      module.hot.accept();
      module.hot.dispose(() => app.close());
    }
    // Graceful shutdown setup for signal handling (SIGTERM, etc.)
    setupGracefulShutdown(app);

    // Apply the exception filter globally
    app.useGlobalFilters(new HttpExceptionFilter());
  } catch (error) {
    // Log the error with appropriate message and stack trace
    Logger.error('Error during application bootstrap', error.stack);
    process.exit(1); // Exit the process with a failure code
  }
}

bootstrap();
