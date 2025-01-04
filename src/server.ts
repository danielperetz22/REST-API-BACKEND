import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import postRoutes from './Routes/PostsRoutes';
import CommentRoutes from './Routes/CommentRoutes';
import authRoutse from './Routes/AuthRoutes';
import bodyParser from "body-parser";
import { Express } from 'express';


const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/posts", postRoutes);
app.use("/comments", CommentRoutes);
app.use("/auth", authRoutse);

app.use(express.json());
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});



const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("Connected to database"));

const initApp = () => {
  return new Promise<Express>((resolve, reject) => {
    if (!process.env.MONGO_URI) { 
      reject("MONGO_URI is not defined in .env file");
    } else {
      mongoose.connect(process.env.MONGO_URI).then(() => {
          resolve(app);
        })
        .catch((error) => {
          reject(error);
        });
    }
  });
};

export default initApp;