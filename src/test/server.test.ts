import initApp from "../server";
import mongoose from "mongoose";
import { Express } from "express";

describe("Server Initialization", () => {
  let originalMongoUri: string | undefined;

  beforeAll(() => {
    originalMongoUri = process.env.MONGO_URI;
  });

  afterAll(async () => {
    process.env.MONGO_URI = originalMongoUri;
    await mongoose.connection.close();
  });

  test("Throws error when MONGO_URI is not defined", async () => {
    delete process.env.MONGO_URI; 

    await expect(initApp()).rejects.toThrow("MONGO_URI is not defined in the environment variables");
  });

  test("Throws error when MongoDB connection fails", async () => {
    jest.spyOn(mongoose, "connect").mockRejectedValueOnce(new Error("Mocked connection error"));

    process.env.MONGO_URI = "mongodb://invalid-uri";

    await expect(initApp()).rejects.toThrow("Mocked connection error");

    jest.restoreAllMocks(); 
  });

  test("Initializes app and connects to MongoDB successfully", async () => {
    jest.spyOn(mongoose, "connect").mockResolvedValueOnce(mongoose);

    process.env.MONGO_URI = "mongodb://valid-uri";

    const app: Express = await initApp();
    expect(app).toBeDefined();

    jest.restoreAllMocks();
  });
});
