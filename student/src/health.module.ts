import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus'; // Import TerminusModule
import { HttpModule } from '@nestjs/axios';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    TerminusModule, // TerminusModule provides the HealthCheckService and various health indicators
    HttpModule, // HttpModule is needed for HttpHealthIndicator
  ],
  controllers: [HealthController], // Register the HealthController
})
export class HealthModule {}
