import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongoDBConnectorService } from './database';

@Module({
  imports: [
    // Load Mongoose connection configuration from ConfigService or .env file
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URL'),
      }),
      inject: [ConfigService],
    }),
    ConfigModule, // Ensure ConfigModule is imported here
  ],
  providers: [MongoDBConnectorService],
  exports: [MongoDBConnectorService],
})
export class MongoDBModule {}
