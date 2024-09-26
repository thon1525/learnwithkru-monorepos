import express, { Application } from 'express';
import { getConfig } from './utils/createConfig';
import cors from 'cors';
import path from 'path';
import loggerMiddleware from './middlewares/loggerMiddleware';
import swaggerUi from 'swagger-ui-express';
import { errorHandler } from './middlewares/errorsHandler';
import { RegisterRoutes } from './routes/v1/routes';
import compression from 'compression';
export const app: Application = express();
const currentEnv = process.env.NODE_ENV || 'production';
const config = getConfig(currentEnv);
//global middleware
app.use(compression());
app.set('trust proxy', 1);
app.use(
  cors({
    origin: config.apiGateway,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  })
);
app.use(express.static('public'));
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '200mb' }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(loggerMiddleware);

// Serve the Swagger UI
app.use(
  '/swagger',
  swaggerUi.serve,
  swaggerUi.setup(undefined, {
    swaggerOptions: {
      url: '/swagger.json', // Point to the generated Swagger JSON file
    },
  })
);
// Serve the generated Swagger JSON file
app.get('/swagger.json', (_req, res) => {
  res.sendFile(path.join(__dirname, './swagger-dist/swagger.json'));
});

// Router
RegisterRoutes(app);
//error handler middlewares
app.use(errorHandler);
