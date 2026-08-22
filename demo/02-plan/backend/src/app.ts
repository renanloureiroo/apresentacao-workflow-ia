import express, { Express, Request, Response } from 'express';
import cors from 'cors';

export function createApp(): Express {
  const app: Express = express();

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get('/health', (_req: Request, res: Response) => {
    console.log('[health]: health check requested');
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
    });
  });

  return app;
}
