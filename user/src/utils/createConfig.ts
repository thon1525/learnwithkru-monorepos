import dotenv from 'dotenv';
import path from 'path';

function createConfig(configPath: string) {
  dotenv.config({ path: configPath });
  // Validate essential configuration
  const reqConfig = [
    'NODE_ENV',
    'PORT',
    'MONGODB_URL',
    'LOG_LEVEL',
    'AUTH_SERVICE_GET',
    'API_GATEWAY',
    'TEACHER_SERVICE',
  ];
  const missingConfig = reqConfig.filter((key) => !process.env[key]);
  if (reqConfig.length > 0) {
    `Missing required environment variables: ${missingConfig.join(', ')}`;
  }
  // Return configuration object
  return {
    env: process.env.NODE_ENV,
    port: process.env.PORT,
    mongoUrl: process.env.MONGODB_URL,
    logLevel: process.env.LOG_LEVEL,
    apiGateway: process.env.API_GATEWAY,
    authService: process.env.AUTH_SERVICE_GET,
    teacherService: process.env.TEACHER_SERVICE,
    studentService: process.env.STUDENT_SERVICE,
  };
}

//console.log(createConfig(`development`));
const getConfig = (currectEnv: string = `development`) => {
  const configPath =
    currectEnv === 'development'
      ? path.join(__dirname, `../../configs/.env`)
      : path.join(__dirname, `../../configs/.env.${currectEnv}`);
  return createConfig(configPath);
};

export { getConfig };
