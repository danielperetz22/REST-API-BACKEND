"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const AuthControllers_1 = __importDefault(require("../controllers/AuthControllers"));
router.post('/register', AuthControllers_1.default.register);
router.post('/login', AuthControllers_1.default.login);
router.get('/validate', AuthControllers_1.default.validateToken);
// router.get('/protected', AuthControllers.AuthMiddleware, (req, res) => {
//   res.status(200).json({ message: 'You have access to the protected route!' });
// });
router.get('/protected', AuthControllers_1.default.AuthMiddleware);
exports.default = router;
