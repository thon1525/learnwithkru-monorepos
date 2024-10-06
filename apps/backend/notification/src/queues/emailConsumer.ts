import { IEmailLocals } from '@notification/utils/@types/EmailSenderType';
import { getConfig } from '@notification/utils/createConfig';
import EmailSender from '@notification/utils/EmailSender';
import { logger } from '@notification/utils/logger';
import { Channel, ConsumeMessage } from 'amqplib';
import { createQueueConnection } from './connection';

// TODO:
// 1. Check If Channel Exist. If Not Create Once
// 2. Define ExchangeName, RoutingKey, QueueName
// 3. Check if Exchange Exist, If Not Create Once
// 4. Check if Queue Exist, If Not Create Once
// 5. Bind the Exchange to Queue by Routing Key
// 6. Consumer: Send Email When there is a message from Queue

const currentEnv = process.env.NODE_ENV || 'development';
const config = getConfig(currentEnv);
export async function consumeAuthEmailMessages(
  channel: Channel
): Promise<void> {
  try {
    if (!channel) {
      channel = (await createQueueConnection()) as Channel;
    }

    const exchangeName = 'learnwithkru-verify-email';
    const routingKey = 'auth-email';
    const queueName = 'auth-email-queue';

    await channel.assertExchange(exchangeName, 'direct');
    const queue = await channel.assertQueue(queueName, {
      durable: true,
      autoDelete: false,
    });

    await channel.bindQueue(queue.queue, exchangeName, routingKey);

    channel.consume(queue.queue, async (msg: ConsumeMessage | null) => {
      const { receiverEmail, username, verifyLink, resetLink, template } =
        JSON.parse(msg!.content.toString());

      const locals: IEmailLocals = {
        appLink: `${config.clientUrl}`,
        appIcon: `https://learnwithkru.com/_next/image?url=%2FLogos%2FKruLogo.png&w=640&q=75`,
        username,
        verifyLink,
        resetLink,
      };

      const emailUserSender = EmailSender.getInstance();
      await emailUserSender.sendEmail(template, receiverEmail, locals);

      // Acknowledgement
      channel.ack(msg!);
    });
  } catch (error) {
    logger.error(
      `NotificationService EmailConsumer consumeAuthEmailMessages() method error: ${error}`
    );
  }
}
