import dotenv from 'dotenv';
dotenv.config();

import createApp from './config/app';
import connectDB from './config/database';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Create Express app
    const app = createApp();
    
    // Start server
    const server = app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
    });
    
    // Graceful shutdown
    process.on('unhandledRejection', (err: Error) => {
      console.error('Unhandled Rejection:', err);
      server.close(() => {
        process.exit(1);
      });
    });
    
    process.on('SIGTERM', () => {
      console.log('SIGTERM received, shutting down gracefully');
      server.close(() => {
        console.log('Process terminated');
      });
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();