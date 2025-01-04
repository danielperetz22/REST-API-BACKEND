"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AuthControllers_1 = __importDefault(require("../controllers/AuthControllers"));
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
router.post("/register", (req, res) => {
    AuthControllers_1.default.register(req, res);
});
router.post("/register", (req, res) => {
    AuthControllers_1.default.login(req, res);
});
exports.default = router;
//# sourceMappingURL=AuthRoutes.js.map