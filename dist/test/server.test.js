"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = __importDefault(require("../server"));
const mongoose_1 = __importDefault(require("mongoose"));
describe("Server Initialization", () => {
    let originalMongoUri;
    beforeAll(() => {
        originalMongoUri = process.env.MONGO_URI;
    });
    afterAll(async () => {
        process.env.MONGO_URI = originalMongoUri;
        await mongoose_1.default.connection.close();
    });
    test("Throws error when MONGO_URI is not defined", async () => {
        delete process.env.MONGO_URI;
        await expect((0, server_1.default)()).rejects.toThrow("MONGO_URI is not defined in the environment variables");
    });
    test("Throws error when MongoDB connection fails", async () => {
        jest.spyOn(mongoose_1.default, "connect").mockRejectedValueOnce(new Error("Mocked connection error"));
        process.env.MONGO_URI = "mongodb://invalid-uri";
        await expect((0, server_1.default)()).rejects.toThrow("Mocked connection error");
        jest.restoreAllMocks();
    });
    test("Initializes app and connects to MongoDB successfully", async () => {
        jest.spyOn(mongoose_1.default, "connect").mockResolvedValueOnce(mongoose_1.default);
        process.env.MONGO_URI = "mongodb://valid-uri";
        const app = await (0, server_1.default)();
        expect(app).toBeDefined();
        jest.restoreAllMocks();
    });
});
