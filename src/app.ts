import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import ticketRouter from './routes/ticketRoutes';
import commentRouter from './routes/commentRoutes';

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/tickets', ticketRouter);
app.use('/tickets', commentRouter);

// Global error handler
app.use(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(err);
    if (err.status && err.message) {
      return res.status(err.status).json({ error: err.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
);

export default app;

