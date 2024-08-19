import { Channel } from 'amqplib';
import { createQueueConnection } from './connection';
import { logger } from '@notification/utils/logger';

export async function consumeNotificationMessages(
  channel: Channel
): Promise<void> {
  try {
    if (!channel) {
      channel = (await createQueueConnection()) as Channel;
    }

    const exchangeName = 'learnwithkru-notification-message';
    const routingKey = 'notification-message';
    const queueName = 'notification-message-queue';

    await channel.assertExchange(exchangeName, 'direct');
    const queue = await channel.assertQueue(queueName, {
      durable: true,
      autoDelete: false,
    });
    await channel.bindQueue(queue.queue, exchangeName, routingKey);

    // channel.consume(queue.queue, async (msg: ConsumeMessage | null) => {
    //   const { type, title, message, timestamp, template, receiver } =
    //     JSON.parse(msg!.content.toString());

    //   const messageDetailsLocals: IMessageLocals = {
    //     type,
    //     title,
    //     message,
    //     timestamp,
    //   };
    //   const notificationUserSender = SocketSender.getInstance();
    //   await notificationUserSender.sendNotification(
    //     template,
    //     receiver,
    //     messageDetailsLocals
    //   );
    // });
  } catch (error) {
    logger.error(
      `NotificationService EmailConsumer consumeNotificationMessage() method error: ${error}`
    );
  }
}
