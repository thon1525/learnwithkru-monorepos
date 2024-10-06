import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppController } from './controllers/app.controller';
import { AppService } from './services/app.service';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { ThrottlerModule } from '@nestjs/throttler';
import { MongoDBModule } from './mongodb.module';
import { LoggerMiddleware } from './middlewares/LoggerMiddleware';
import { HealthModule } from './health.module';
import { StudentController } from './controllers/student.controller';
import { StudentService } from './services/student.service';
import { StudentRepository } from './database/repositories/student.repository';
import { StudentModule } from './student.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath:
        process.env.NODE_ENV === 'production'
          ? '.env.production'
          : 'configs/.env', // Dynamically load the right .env file
      isGlobal: true, // Makes ConfigModule globally available
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'), // Path to your static files directory
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
    MongoDBModule,
    HealthModule,
    StudentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*'); // Apply to all routes
  }
}
