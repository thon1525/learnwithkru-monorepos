import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MongoDBConnectorService {
  private readonly logger = new Logger(MongoDBConnectorService.name);
  private mongoUrl: string;

  constructor(
    @InjectConnection() private readonly connection: Connection,
    private readonly configService: ConfigService,
  ) {
    // Fetch MONGODB_URL from ConfigService
    this.mongoUrl = this.configService.get<string>('MONGODB_URL');
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.connection.on('connected', () => {
      this.logger.log('MongoDB connected');
    });

    this.connection.on('error', (error) => {
      this.logger.error('Error in MongoDB connection', error);
    });

    this.connection.on('disconnected', () => {
      this.logger.warn('MongoDB disconnected');
    });
  }

  public async connect(url: string): Promise<void> {
    this.mongoUrl = url || this.mongoUrl;
    this.logger.log('hello ', this.mongoUrl);
    try {
      await this.connection.openUri(this.mongoUrl);
      this.logger.log('Successfully connected to MongoDB');
    } catch (err) {
      this.logger.error('Initial MongoDB connection error', err);
    }
  }

  public async disconnect(): Promise<void> {
    try {
      await this.connection.close();
      this.connection.removeAllListeners();
      this.logger.log('MongoDB disconnected and listeners removed');
    } catch (error) {
      this.logger.error('Error during MongoDB disconnection', error);
    }
  }
}
