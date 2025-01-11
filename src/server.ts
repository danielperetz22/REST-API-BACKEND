import express, { Express } from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import postRoutes from './Routes/PostsRoutes';
import CommentRoutes from './Routes/CommentRoutes';
import AuthRoutes from './Routes/AuthRoutes';

dotenv.config();

const initApp = async (): Promise<Express> => {
  const app = express();

  app.use(express.json());

  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
  });


  app.use('/post', postRoutes);
  app.use('/comment', CommentRoutes);
  app.use('/auth', AuthRoutes);


  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error("MONGO_URI is not defined in the environment variables");
  }

  try {
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    throw err; 
  }

  return app;
};

export default initApp;
