import "dotenv/config";

export const env = {
  PORT: process.env.PORT,
  MONGO_URI: process.env.MONGO_URI,
  FRONTEND_URLS: process.env.FRONTEND_URLS,
};
