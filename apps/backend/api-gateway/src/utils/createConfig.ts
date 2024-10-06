import dotenv from "dotenv";
import path from "path";

function createConfig(configPath: string) {
  dotenv.config({ path: configPath });
  // Validate essential configuration
  const reqConfig = [
    "NODE_ENV",
    "PORT",
    "LOG_LEVEL",
    "CLIENT_URL",
    "COOKIE_SECRET_KEY_ONE",
    "COOKIE_SECRET_KEY_TWO",
    "NOTIFICATION_SERVICE_URL",
    "AUTH_SERVICE_URL",
    "USER_SERVICE_URL",
    "RABBITMQ_ENDPOINT",
  ];
  const missingConfig = reqConfig.filter((key) => !process.env[key]);
  if (reqConfig.length > 0) {
    `Missing required environment variables: ${missingConfig.join(", ")}`;
  }
  // Return configuration object
  return {
    env: process.env.NODE_ENV,
    port: process.env.PORT,
    logLevel: process.env.LOG_LEVEL,
    cookieSecretKeyOne: process.env.COOKIE_SECRET_KEY_ONE,
    cookieSecretKeyTwo: process.env.COOKIE_SECRET_KEY_TWO,
    clientUrl: process.env.CLIENT_URL,
    notificationUrl: process.env.NOTIFICATION_SERVICE_URL,
    authServiceUrl: process.env.AUTH_SERVICE_URL,
    userServiceUrl: process.env.USER_SERVICE_URL,
    rabbitMQ: process.env.RABBITMQ_ENDPOINT,
  };
}

//console.log(createConfig(`development`));
const getConfig = (currectEnv: string = `development`) => {
  const configPath =
    currectEnv === "development"
      ? path.join(__dirname, `../../configs/.env`)
      : path.join(__dirname, `../../configs/.env.${currectEnv}`);
  return createConfig(configPath);
};

export { getConfig };
