"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const PostControllers_1 = __importDefault(require("../controllers/PostControllers"));
router.post('/', PostControllers_1.default.addPost);
router.get('/filter/bySender', PostControllers_1.default.getPostsBySender);
router.get('/all', PostControllers_1.default.getAllPosts);
router.get('/:id', PostControllers_1.default.getPostById);
router.put('/:id', PostControllers_1.default.updatePost);
router.post('/', (req, res, next) => {
    console.log('Request reached POST /');
    next();
});
exports.default = router;
//# sourceMappingURL=PostsRoutes.js.map