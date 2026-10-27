import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import routes from './routes';
import { globalErrorHandler } from './middleware/errorHandler';

const app: Application = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Route
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'UP', service: 'Blood Donation System API', timestamp: new Date() });
});

// API Routes
app.use('/api/v1', routes);

// Centralized Error Handling
app.use(globalErrorHandler);

export default app;
