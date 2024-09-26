import client, { Channel, Connection } from 'amqplib';
import { logger } from '@auth/utils/logger';
import { getConfig } from '@auth/utils/createConfig';
import { BaseCustomError } from '@auth/errors/BaseCustomError';
import { StatusCode } from '@auth/utils/StatusCode';

export async function createQueueConnection(): Promise<Channel | undefined> {
  const currentEnv = process.env.NODE_ENV || 'development';
  const config = getConfig(currentEnv);
  const rabbitMQUrl = config.rabbitMQ;

  if (!rabbitMQUrl) {
    const errorMessage = 'RabbitMQ URL is not defined in the configuration';
    logger.error(errorMessage);
    throw new BaseCustomError(errorMessage, StatusCode.ServiceUnavailable);
  }

  try {
    const connection: Connection = await client.connect(rabbitMQUrl);
    const channel: Channel = await connection.createChannel();
    logger.info('Auth Server connected to queue successfully.');

    closeConnection(channel, connection);
    return channel;
  } catch (error) {
    logger.error(
      `Error creating RabbitMQ connection: ${(error as Error).message}`
    );
    return undefined;
  }
}

export async function closeConnection(
  channel: Channel,
  connection: Connection
): Promise<void> {
  process.once('SIGINT', async () => {
    await channel.close();
    await connection.close();
  });
}
