import dotenv from 'dotenv';
dotenv.config();

// Define configuration interface
interface Config {
  port: number;
  database: {
    url: string;
  };
  cors: {
    allowedOrigins: string[];
  };
  environment: string;
}

// Create configuration object
const config: Config = {
  port: parseInt(process.env.PORT || '3000', 10),
  database: {
    url: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/screener'
  },
  cors: {
    allowedOrigins: ['http://localhost:5173', 'https://happinessengineer.github.io']
  },
  environment: process.env.NODE_ENV || 'development'
};

// Export configuration
export default config; 