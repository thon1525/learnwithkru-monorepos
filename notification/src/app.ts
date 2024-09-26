import express from 'express';
import { healthRoutes } from './routes/routes';
import { errorHandler } from './middlewares/errorHandler';

//app
const app = express();

// Set the view engine to EJS
app.set('view engine', 'ejs');
//Health Route [Not via API Gateway]
app.use('/health', healthRoutes);
//error handler middlewares
app.use(errorHandler);
export default app;
