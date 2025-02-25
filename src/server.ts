import express, { Express } from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import postRoutes from './Routes/PostsRoutes';
import CommentRoutes from './Routes/CommentRoutes';
import AuthRoutes from './Routes/AuthRoutes';
import bodyParser from "body-parser";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import cors from "cors";
import fs from "fs";
import path from "path";

const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

dotenv.config();
const app = express();
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173"); 
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  next();
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/post', postRoutes);
app.use('/comment', CommentRoutes);
app.use('/auth', AuthRoutes);
app.use("/uploads", express.static(uploadsDir, {
  setHeaders: (res, path, stat) => {
    res.setHeader("Cross-Origin-Resource-Policy", "same-site");
  }
}));


const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Hila and Daniel's REST API",
      version: "1.0.0",
      description: "REST server including authentication using JWT",
    },
    servers: [{ url: "http://localhost:"+ process.env.PORT }],
  },
  apis: ["./src/Routes/*.ts"],
};
const specs = swaggerJsdoc(options);
app.use("/api-docs",swaggerUi.serve,swaggerUi.setup(specs));



const initApp = async (): Promise<Express> => {
  return new Promise<Express>((resolve, reject) => {
    const db = mongoose.connection;

    db.on("error", (error) => {
      console.error("Database connection error:", error);
    });

    db.once("open", () => {
      console.log("Connected to database");
    });

    if (!process.env.MONGO_URI) {
      console.error("initApplication UNDEFINED MONGO_URI");
      reject(new Error("MONGO_URI is not defined in the environment variables"));
      return;
    } else {
      mongoose
        .connect(process.env.MONGO_URI)
        .then(() => {
          resolve(app);
        })
        .catch((err) => {
          reject(err);
        });
    }
  });
};


export default initApp;

