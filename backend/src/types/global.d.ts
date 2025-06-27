/// <reference types="node" />

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test';
      PORT?: string;
      MONGODB_URI?: string;
      JWT_SECRET?: string;
      JWT_REFRESH_SECRET?: string;
      JWT_EXPIRE?: string;
      JWT_REFRESH_EXPIRE?: string;
      FRONTEND_URL?: string;
    }
  }
}

export {};