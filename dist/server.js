"use strict";
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
const body_parser_1 = __importDefault(require("body-parser"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use('/post', PostsRoutes_1.default);
app.use('/comment', CommentRoutes_1.default);
app.use('/auth', AuthRoutes_1.default);
const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Hila and Daniel's REST API",
            version: "1.0.0",
            description: "REST server including authentication using JWT",
        },
        servers: [{ url: "http://localhost:3000" }],
    },
    apis: ["./src/Routes/*.ts"],
};
const initApp = async () => {
    return new Promise((resolve, reject) => {
        const db = mongoose_1.default.connection;
        db.on("error", (error) => {
            console.error("Database connection error:", error);
        });
        db.once("open", () => {
            console.log("Connected to database");
        });
        if (!process.env.MONGO_URI) {
            console.error("initApplication UNDEFINED MONGO_URI");
            reject();
            return;
        }
        else {
            mongoose_1.default.connect(process.env.MONGO_URI).then(() => {
                resolve(app);
            });
        }
    });
};
exports.default = initApp;
