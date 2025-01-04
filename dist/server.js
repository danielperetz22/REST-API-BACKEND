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
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});
app.use('/post', PostsRoutes_1.default);
app.use('/comment', CommentRoutes_1.default);
mongoose_1.default.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/mydb')
    .then(() => {
    console.log("Connected to MongoDB");
})
    .catch((err) => {
    console.error("MongoDB connection error:", err);
});
exports.default = app;
//# sourceMappingURL=server.js.map