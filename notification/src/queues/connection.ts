import { getConfig } from '@notification/utils/createConfig';
import client, { Channel, Connection } from 'amqplib';
import { logger } from '@notification/utils/logger';
import { consumeAuthEmailMessages } from './emailConsumer';
import { consumeNotificationMessages } from './notificationConsumer';
const currentEnv = process.env.NODE_ENV || 'development';
const config = getConfig(currentEnv);
export async function createQueueConnection(): Promise<Channel | undefined> {
  try {
    const connection: Connection = await client.connect(`${config.rabbitMQ}`);
    const channel: Channel = await connection.createChannel();
    logger.info('Nofiication server connected to queue successfully...');
    closeQueueConnection();
    return channel;
  } catch (error: unknown) {
    logger.error(
      `NotificationService createConnection() method error: ${error}`
    );
    return undefined;
  }
}

function closeQueueConnection() {
  process.once(
    'SIGINT',
    async (channel: Channel, connection: Connection): Promise<void> => {
      await channel.close();
      await connection.close();
    }
  );
}

export async function startQueue(): Promise<void> {
  try {
    const emailChannel: Channel = (await createQueueConnection()) as Channel;
    await consumeAuthEmailMessages(emailChannel);
    await consumeNotificationMessages(emailChannel);
  } catch (error) {
    throw error;
  }
}
