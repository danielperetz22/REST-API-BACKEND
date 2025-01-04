import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import postRoutes from './Routes/PostsRoutes';
import CommentRoutes from './Routes/CommentRoutes';


dotenv.config();


const app = express();


app.use(express.json());
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});


app.use('/post', postRoutes);
app.use('/comment', CommentRoutes);


mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/mydb')
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

export default app;
