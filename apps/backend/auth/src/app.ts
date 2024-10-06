import express, { Application } from 'express';
import { getConfig } from './utils/createConfig';
import redoc from 'redoc-express';
// import * as swaggerDocument from "../public/swagger.json";
import compression from 'compression';
import cors from 'cors';
import path from 'path';
import loggerMiddleware from './middlewares/loggerMiddleware';
import swaggerUi from 'swagger-ui-express';
import { errorHandler } from './middlewares/errorsHandler';
import { RegisterRoutes } from './routes/v1/routes';
const app: Application = express();
app.use(compression());
const currentEnv = process.env.NODE_ENV || 'development';
const config = getConfig(currentEnv);
//global middleware
app.set('trust proxy', 1);
app.use(
  cors({
    origin: config.apiGateway,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  })
);
app.use(express.static('public'));
app.use(express.json({ limit: '10mb' }));
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

// API Documentation
app.get(
  '/wiki-docs',
  redoc({
    title: 'API Docs',
    specUrl: '/swagger.json',
    redocOptions: {
      theme: {
        colors: {
          primary: {
            main: '#6EC5AB',
          },
        },
        typography: {
          fontFamily: `"museo-sans", 'Helvetica Neue', Helvetica, Arial, sans-serif`,
          fontSize: '15px',
          lineHeight: '1.5',
          code: {
            code: '#87E8C7',
            backgroundColor: '#4D4D4E',
          },
        },
        menu: {
          backgroundColor: '#ffffff',
        },
      },
    },
  })
);
//app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
// Register routes generated
RegisterRoutes(app);

//error handler middlewares
app.use(errorHandler);
export default app;
