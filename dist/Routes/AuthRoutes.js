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
router.post('/logout', AuthControllers_1.default.logout);
router.post('/refresh', AuthControllers_1.default.refresh);
exports.default = router;
