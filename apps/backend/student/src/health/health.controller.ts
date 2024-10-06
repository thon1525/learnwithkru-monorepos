import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
  MongooseHealthIndicator,
  MemoryHealthIndicator,
  DiskHealthIndicator,
} from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private mongoose: MongooseHealthIndicator,
    private memory: MemoryHealthIndicator,
    private disk: DiskHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  async check() {
    return this.health.check([
      // Check HTTP service (example: an external URL)
      async () => this.http.pingCheck('nestjs-docs', 'https://docs.nestjs.com'),

      // Check Mongoose connection health
      async () => this.mongoose.pingCheck('mongodb'),

      // Check memory usage
      async () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024), // Check if heap is below 150MB
      async () => this.memory.checkRSS('memory_rss', 300 * 1024 * 1024), // Check if RSS is below 300MB

      // Check disk space
      async () =>
        this.disk.checkStorage('disk_storage', {
          thresholdPercent: 0.9, // Fail if 90% of the disk is used
          path: '/', // Check the root path
        }),
    ]);
  }
}
