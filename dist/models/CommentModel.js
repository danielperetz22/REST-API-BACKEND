"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const comments_Schema = new mongoose_1.default.Schema({
    content: {
        type: String, required: true,
    },
    postId: {
        type: String, required: true,
    },
    owner: {
        type: String, required: true,
    },
    email: {
        type: String, required: true
    },
    username: {
        type: String, required: true
    },
});
const Comment = mongoose_1.default.model("Comments", comments_Schema);
exports.default = Comment;
