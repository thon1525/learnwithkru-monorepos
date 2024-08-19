import express from 'express';
import { healthRoutes } from './routes/routes';
import { errorHandler } from './middlewares/errorHandler';

//app
const app = express();

//Health Route [Not via API Gateway]
app.use('/health', healthRoutes);
//error handler middlewares
app.use(errorHandler);
export default app;
