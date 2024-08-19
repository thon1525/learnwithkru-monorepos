import { SmtpServer, SmtpServerConfig } from './@types/EmailSenderType';
import { getConfig } from './createConfig';

const currentEnv = process.env.NODE_ENV || 'development';
const config = getConfig(currentEnv);

export default class NodemailerSmtpServer implements SmtpServer {
  private host = config.smtpHost;
  private port = parseInt(config.smtpPort!);
  private user = config.senderEmail;
  private pass = config.senderEmailPassword;

  getConfig(): SmtpServerConfig {
    return {
      host: this.host as string,
      port: this.port,
      auth: {
        user: this.user as string,
        pass: this.pass as string,
      },
    };
  }
}
