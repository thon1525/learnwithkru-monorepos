import Mail from 'nodemailer/lib/mailer';
import nodemailer from 'nodemailer';
import path from 'path';
import { logger } from './logger';

import Email from 'email-templates';
import { getConfig } from './createConfig';
import { EmailApi, IEmailLocals } from './@types/EmailSenderType';

import NodemailerSmtpServer from './NodemailerSmtpServer';
const currentEnv = process.env.NODE_ENV || 'development';
const config = getConfig(currentEnv);

export default class NodemailerEmailApi implements EmailApi {
  private transporter: Mail;

  constructor() {
    this.transporter = nodemailer.createTransport(
      new NodemailerSmtpServer().getConfig()
    );
  }

  async sendEmail(
    template: string,
    receiver: string,
    locals: IEmailLocals
  ): Promise<void> {
    try {
      const email: Email = new Email({
        message: {
          from: `Learnwithkru <${config.senderEmail}>`,
        },
        send: true,
        preview: false,
        transport: this.transporter,
        views: {
          options: {
            extension: 'ejs',
          },
        },
        juice: true, // use inline css style
        juiceResources: {
          preserveImportant: true,
          webResources: {
            relativeTo: path.join(__dirname, '../../build'),
          },
        },
      });

      await email.send({
        template: path.join(__dirname, '../../src/emails', template),
        message: {
          to: receiver,
        },
        locals: locals,
      });

      logger.info(`Email send successfully.`);
    } catch (error) {
      logger.error(`NotificationService SendMail() method error: ${error}`);
    }
  }
}
