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
exports.AuthMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const AuthModel_1 = __importDefault(require("../models/AuthModel"));
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const email = req.body.email;
    const password = req.body.password;
    if (!email || !password) {
        res.status(400).json({ message: 'Email and password are required' });
        return;
    }
    const user = yield AuthModel_1.default.findOne({ email: email });
    if (user) {
        res.status(400).json({ message: 'Email already exists' });
        return;
    }
    try {
        const newUser = new AuthModel_1.default(req.body);
        yield newUser.save();
        res.status(201).json(newUser);
        return;
    }
    catch (err) {
        res.status(500).json({ message: 'Internal server error' });
        return;
    }
});
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const email = req.body.email;
    const password = req.body.password;
    if (!email || !password) {
        res.status(400).json({ message: 'Email and password are required' });
        return;
    }
    const user = yield AuthModel_1.default.findOne({ email: email });
    if (!user) {
        res.status(400).json({ message: 'Invalid email or password' });
        return;
    }
    const isMatch = yield bcrypt_1.default.compare(password, user.password);
    if (!isMatch) {
        res.status(400).json({ message: 'Invalid email or password' });
        return;
    }
    const token = jsonwebtoken_1.default.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ token });
    return;
});
const AuthMiddleware = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        req.body.userId = decoded;
    }
    catch (err) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    next();
};
exports.AuthMiddleware = AuthMiddleware;
exports.default = { register, login };
