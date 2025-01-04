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
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    if (!email || !password || !username) {
        return res.status(400).json({ message: 'username, Email and password are required' });
    }
    const user = yield AuthModel_1.default.findOne({ username: username });
    if (user) {
        return res.status(400).json({ message: 'username already exists' });
    }
    const userEmail = yield AuthModel_1.default.findOne({ email: email });
    if (userEmail) {
        return res.status(400).json({ message: 'Email already exists' });
    }
    try {
        const newUser = new AuthModel_1.default(req.body);
        yield newUser.save();
        return res.status(201).json(newUser);
    }
    catch (err) {
        return res.status(500).json({ message: 'Internal server error' });
    }
});
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    if (!email || !password || !username) {
        return res.status(400).json({ message: 'username, Email and password are required' });
    }
    const user = yield AuthModel_1.default.findOne({ username: username });
    if (!user) {
        return res.status(400).json({ message: 'Invalid username' });
    }
    const userEmail = yield AuthModel_1.default.findOne({ email: email });
    if (userEmail) {
        return res.status(400).json({ message: 'Invalid Email' });
    }
    const isMatch = yield bcrypt_1.default.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json({ message: 'Invalid email or password' });
    }
    const token = jsonwebtoken_1.default.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return res.status(200).json({ token });
});
const AuthMiddleware = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        req.body.userId = decoded;
    }
    catch (err) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    next();
};
exports.AuthMiddleware = AuthMiddleware;
exports.default = { register, login };
//# sourceMappingURL=AuthControllers.js.map