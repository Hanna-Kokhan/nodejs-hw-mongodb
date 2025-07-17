import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
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
import swaggerUi from 'swagger-ui-express';

const PORT = Number(getEnvVar(ENV_VARS.PORT, '3000'));

export function setupServer() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const rootDir = path.join(__dirname, '..');

  let swaggerDocument;
  try {
    const swaggerFilePath = path.join(rootDir, 'docs', 'swagger.json');
    const swaggerFileContent = fs.readFileSync(swaggerFilePath, 'utf8');
    swaggerDocument = JSON.parse(swaggerFileContent);
  } catch (error) {
    console.error('Помилка читання swagger.json:', error);
    process.exit(1);
  }
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

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

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
