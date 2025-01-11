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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const AuthModel_1 = __importDefault(require("../models/AuthModel"));
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        res.status(400).json({ message: 'Username, email, and password are required' });
        return;
    }
    const existingUser = yield AuthModel_1.default.findOne({
        $or: [{ username }, { email }]
    });
    if (existingUser) {
        if (existingUser.email === email) {
            res.status(400).json({ message: 'Email already in use' });
            return;
        }
        if (existingUser.username === username) {
            res.status(400).json({ message: 'Username already in use' });
            return;
        }
    }
    try {
        const salt = yield bcrypt_1.default.genSalt(10);
        const hashedPassword = yield bcrypt_1.default.hash(password, salt);
        const newUser = new AuthModel_1.default({ username, email, password: hashedPassword });
        yield newUser.save();
        res.status(201).json(newUser);
    }
    catch (err) {
        res.status(500).json({ message: 'Internal server error' });
    }
});
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, email, password } = req.body;
    if ((!username && !email) || !password) {
        res.status(400).json({ message: 'Username or email and password are required' });
        return;
    }
    try {
        const user = yield AuthModel_1.default.findOne({
            $or: [{ username }, { email }]
        });
        if (!user) {
            res.status(400).json({ message: 'Invalid username or email' });
            return;
        }
        const isMatch = yield bcrypt_1.default.compare(password, user.password);
        if (!isMatch) {
            res.status(400).json({ message: 'Invalid password' });
            return;
        }
        const accessToken = jsonwebtoken_1.default.sign({ id: user._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.JWT_TOKEN_EXPIRATION });
        res.status(200).json({ accessToken });
        return;
    }
    catch (err) {
        console.error('Error during login:', err);
        res.status(500).json({ message: 'Internal server error' });
        return;
    }
});
const AuthMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    console.log('Authorization Header:', authHeader);
    const token = authHeader && authHeader.split(' ')[1];
    console.log('Extracted Token:', token);
    if (!token) {
        res.status(401).json({ message: 'Authorization token is missing' });
        return;
    }
    jsonwebtoken_1.default.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        console.log('JWT Verification Attempt:', { err, user });
        if (err) {
            res.status(403).json({ message: 'Invalid or expired token', error: err.message });
            return;
        }
        req.user = user;
        next();
    });
};
const validateToken = (req, res) => {
    try {
        const authHeader = req.header('Authorization');
        if (!authHeader) {
            res.status(401).json({ message: 'Authorization header is missing' });
            return;
        }
        if (!authHeader.startsWith('Bearer ')) {
            res.status(401).json({ message: 'Invalid Authorization format' });
            return;
        }
        const token = authHeader.split(' ')[1];
        if (!token) {
            res.status(401).json({ message: 'Token is missing' });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.ACCESS_TOKEN_SECRET);
        res.status(200).json({ message: 'Token is valid', decoded });
        return;
    }
    catch (err) {
        console.error('Token validation error:', err);
        res.status(401).json({ message: 'Invalid or expired token' });
        return;
    }
};
exports.default = { register, login, AuthMiddleware, validateToken };
