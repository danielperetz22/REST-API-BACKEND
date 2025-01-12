"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const PostControllers_1 = __importDefault(require("../controllers/PostControllers"));
router.post("/", (req, res) => {
    PostControllers_1.default.create(req, res);
});
router.get("/all", PostControllers_1.default.getAll.bind(PostControllers_1.default));
router.get("/:_id", (req, res) => {
    PostControllers_1.default.getById(req, res);
});
router.put("/:_id", PostControllers_1.default.updatePost.bind(PostControllers_1.default));
// router.get('/filter/bySender', PostControllers.getPostsBySender);
exports.default = router;
