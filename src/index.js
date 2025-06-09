import './utils/getEnvVar.js';
import { initMongoConnection } from './db/initMongoConnection.js';
import { setupServer } from './server.js';

const bootstrap = async () => {
  try {
    await initMongoConnection();
    setupServer();
  } catch (error) {
    console.error('Failed to bootstrap application:', error);
    process.exit(1);
  }
};

bootstrap();
