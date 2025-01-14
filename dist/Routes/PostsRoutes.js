"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const PostControllers_1 = __importDefault(require("../controllers/PostControllers"));
const AuthControllers_1 = require("../controllers/AuthControllers");
router.post("/", AuthControllers_1.authMiddleware, (req, res) => {
    PostControllers_1.default.create(req, res);
});
router.get("/all", PostControllers_1.default.getAll.bind(PostControllers_1.default));
router.get("/:_id", (req, res) => {
    PostControllers_1.default.getById(req, res);
});
router.put("/:_id", AuthControllers_1.authMiddleware, PostControllers_1.default.updatePost.bind(PostControllers_1.default));
exports.default = router;
