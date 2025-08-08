import { config as dotenvConfig } from "dotenv";

dotenvConfig();

interface Config {
  port: number;
  nodeEnv: string;
  host: string;
  dbName: string;
  dbUser: string;
  dbPassword: string;
}

export const config: Config = {
  port: Number(process.env.PORT) || 4000,
  nodeEnv: process.env.NODE_ENV || "development",
  host: process.env.HOST || "localhost",
  dbName: process.env.DB_NAME,
  dbUser: process.env.DB_USER,
  dbPassword: process.env.DB_PASSWORD,
};
