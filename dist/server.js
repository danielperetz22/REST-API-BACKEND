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
const geminiRoutes_1 = __importDefault(require("./Routes/geminiRoutes"));
const body_parser_1 = __importDefault(require("body-parser"));
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const cors_1 = __importDefault(require("cors"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const uploadsDir = path_1.default.join(__dirname, "uploads");
if (!fs_1.default.existsSync(uploadsDir)) {
    fs_1.default.mkdirSync(uploadsDir);
}
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
}));
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use('/post', PostsRoutes_1.default);
app.use('/comment', CommentRoutes_1.default);
app.use('/auth', AuthRoutes_1.default);
app.use("/uploads", express_1.default.static(path_1.default.join(__dirname, "../uploads")));
app.use("/api/gemini", geminiRoutes_1.default);
const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Hila and Daniel's REST API",
            version: "1.0.0",
            description: "REST server including authentication using JWT",
        },
        servers: [{ url: "https://node24.cs.colman.ac.il" }],
    },
    apis: ["./src/Routes/*.ts"],
};
const specs = (0, swagger_jsdoc_1.default)(options);
app.use("/api-docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(specs));
const frontPath = "/home/st111/REST-API-BACKEND/front";
console.log("📂 Serving Frontend from:", frontPath);
app.use(express_1.default.static(frontPath));
app.get("*", (req, res) => {
    console.log("🔍 Request received for:", req.url);
    res.sendFile(path_1.default.join(frontPath, "index.html"));
});
const initApp = () => __awaiter(void 0, void 0, void 0, function* () {
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
});
exports.default = initApp;
//# sourceMappingURL=server.js.map