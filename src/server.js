import express from 'express';
import cors from 'cors';
import pino from 'pino-http';
import { getEnvVar } from './utils/getEnvVar.js';
import router from './routers/index.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';
import cookieParser from 'cookie-parser';
import { ENV_VARS } from './constants/envVars.js';
import { UPLOAD_DIR } from './constants/paths.js';

const PORT = Number(getEnvVar(ENV_VARS.PORT, '3000'));

export function setupServer() {
  const app = express();

  app.use(express.json());
  app.use(
    cors({
      origin: getEnvVar(ENV_VARS.CORS_ORIGIN, 'http://localhost:3000'),
      credentials: true,
    }),
  );
  app.set('json spaces', 2);

  app.use(cookieParser());

  app.use(
    pino({
      transport: {
        target: 'pino-pretty',
      },
    }),
  );

  app.use('/uploads', express.static(UPLOAD_DIR));

  app.get('/', (req, res) => {
    res.status(200).json({
      message: `Server is running. Use /contacts endpoint.`,
    });
  });

  app.use(router);

  app.use(notFoundHandler);
  app.use(errorHandler);

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}
