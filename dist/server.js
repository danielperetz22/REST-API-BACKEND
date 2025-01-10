"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const PostsRoutes_1 = __importDefault(require("./Routes/PostsRoutes"));
const CommentRoutes_1 = __importDefault(require("./Routes/CommentRoutes"));
const AuthRoutes_1 = __importDefault(require("./Routes/AuthRoutes"));
dotenv_1.default.config();
const initApp = () => __awaiter(void 0, void 0, void 0, function* () {
    const app = (0, express_1.default)();
    app.use(express_1.default.json());
    app.use((req, res, next) => {
        console.log(`${req.method} ${req.url}`);
        next();
    });
    app.use('/post', PostsRoutes_1.default);
    app.use('/comment', CommentRoutes_1.default);
    app.use('/auth', AuthRoutes_1.default);
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
        throw new Error("MONGO_URI is not defined in the environment variables");
    }
    try {
        yield mongoose_1.default.connect(mongoUri);
        console.log("Connected to MongoDB");
    }
    catch (err) {
        console.error("MongoDB connection error:", err);
        throw err;
    }
    return app;
});
exports.default = initApp;
