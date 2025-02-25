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
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const uploadsDir = path_1.default.join(__dirname, "uploads");
if (!fs_1.default.existsSync(uploadsDir)) {
    fs_1.default.mkdirSync(uploadsDir);
}
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
    next();
});
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use('/post', PostsRoutes_1.default);
app.use('/comment', CommentRoutes_1.default);
app.use('/auth', AuthRoutes_1.default);
app.use("/uploads", express_1.default.static(uploadsDir, {
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
        servers: [{ url: "http://localhost:" + process.env.PORT }],
    },
    apis: ["./src/Routes/*.ts"],
};
const specs = (0, swagger_jsdoc_1.default)(options);
app.use("/api-docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(specs));
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
            reject(new Error("MONGO_URI is not defined in the environment variables"));
            return;
        }
        else {
            mongoose_1.default
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
exports.default = initApp;
