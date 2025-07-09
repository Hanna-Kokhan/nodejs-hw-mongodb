import './utils/getEnvVar.js';
import { initMongoConnection } from './db/initMongoConnection.js';
import { setupServer } from './server.js';
import { TEMP_UPLOAD_DIR, UPLOAD_DIR } from './constants/paths.js';
import { createDirIfNotExists } from './utils/createDirIfNotExists.js';

const bootstrap = async () => {
  try {
    await initMongoConnection();
    await createDirIfNotExists(TEMP_UPLOAD_DIR);
    await createDirIfNotExists(UPLOAD_DIR);
    setupServer();
  } catch (error) {
    console.error('Failed to bootstrap application:', error);
    process.exit(1);
  }
};

bootstrap();
