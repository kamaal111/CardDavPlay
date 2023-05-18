const DEFAULT_SERVER_PORT = '3001';
const DEFAULT_MONGODB_URL = 'mongodb://127.0.0.1:27017/contacts';

export default {
  SERVER_PORT: process.env.SERVER_PORT ?? DEFAULT_SERVER_PORT,
  MONGODB_URL: process.env.MONGODB_URL ?? DEFAULT_MONGODB_URL,
};
