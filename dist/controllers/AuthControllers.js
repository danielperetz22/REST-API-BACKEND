"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const AuthModel_1 = __importDefault(require("../models/AuthModel"));
const generateTokens = (_id) => {
    if (process.env.ACCESS_TOKEN_SECRET === undefined) {
        return null;
    }
    const rand = Math.random();
    const accessToken = jsonwebtoken_1.default.sign({ _id: _id, rand: rand }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.TOKEN_EXPIRATION });
    const refreshToken = jsonwebtoken_1.default.sign({ _id: _id, rand: rand }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRATION });
    return { refreshToken: refreshToken, accessToken: accessToken };
};
const register = async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        res.status(400).json({ message: "All fields (username, email, and password) are required" });
        return;
    }
    try {
        const existingUser = await AuthModel_1.default.findOne({ $or: [{ username }, { email }], });
        if (existingUser) {
            const errorMessage = existingUser.email === email
                ? "Email is already in use"
                : "Username already in use";
            res.status(400).send({ error: errorMessage });
            return;
        }
        const salt = await bcrypt_1.default.genSalt(10);
        const hashedPassword = await bcrypt_1.default.hash(password, salt);
        const user = await AuthModel_1.default.create({
            username,
            email,
            password: hashedPassword,
        });
        res.status(201).send({
            _id: user._id,
            username: user.username,
            email: user.email,
        });
        return;
    }
    catch (err) {
        console.log(err);
        res.status(400);
        return;
    }
};
const login = async (req, res) => {
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    try {
        if ((!username && !email) || !password) {
            res.status(400).json({ message: "Username or email and password are required" });
            return;
        }
        const user = await AuthModel_1.default.findOne({ $or: [{ username }, { email }] });
        if (!user) {
            res.status(400).json({ message: "Invalid username, email, or password" });
            return;
        }
        const validPassword = await bcrypt_1.default.compare(password, user.password);
        if (!validPassword) {
            res.status(400).json({ message: "Invalid username, email, or password" });
            return;
        }
        const tokens = generateTokens(user._id);
        if (!tokens) {
            res.status(500).json({ message: "Failed to generate tokens" });
            return;
        }
        //console.log("Generated Access Token:", tokens.accessToken);
        if (user.refeshtokens == undefined) {
            user.refeshtokens = [];
        }
        user.refeshtokens.push(tokens.refreshToken);
        user.save();
        res.status(200).json(Object.assign(Object.assign({}, tokens), { _Id: user._id }));
    }
    catch (err) {
        res.status(400).json({ message: "Error during login", error: err });
    }
};
const validateRefreshToken = (refreshToken) => {
    return new Promise((resolve, reject) => {
        if (refreshToken == null) {
            reject("error");
            return;
        }
        if (!process.env.ACCESS_TOKEN_SECRET) {
            reject("error");
            return;
        }
        jsonwebtoken_1.default.verify(refreshToken, process.env.ACCESS_TOKEN_SECRET, async (err, payload) => {
            if (err) {
                reject(err);
                return;
            }
            const userId = payload._id;
            try {
                const user = await AuthModel_1.default.findById(userId);
                if (!user) {
                    reject("error");
                    return;
                }
                //check if token exists
                if (!user.refeshtokens || !user.refeshtokens.includes(refreshToken)) {
                    user.refeshtokens = [];
                    await user.save();
                    reject(err);
                    return;
                }
                resolve(user);
            }
            catch (err) {
                reject(err);
            }
        });
    });
};
const refresh = async (req, res) => {
    try {
        const user = await validateRefreshToken(req.body.refreshToken);
        const tokens = generateTokens(user._id);
        if (!tokens) {
            res.status(400).send("error");
            return;
        }
        user.refeshtokens = user.refeshtokens.filter((token) => token !== req.body.refreshToken);
        user.refeshtokens.push(tokens.refreshToken);
        await user.save();
        res.status(200).send(Object.assign(Object.assign({}, tokens), { _id: user._id }));
    }
    catch (err) {
        res.status(400).send("error");
    }
};
const logout = async (req, res) => {
    try {
        const user = await validateRefreshToken(req.body.refreshToken);
        if (!user) {
            res.status(400).send("error");
            return;
        }
        //remove the token from the user
        user.refeshtokens = user.refeshtokens.filter((token) => token !== req.body.refreshToken);
        await user.save();
        res.status(200).send("logged out");
    }
    catch (err) {
        res.status(400).send("error");
        return;
    }
};
const authMiddleware = (req, res, next) => {
    const tokenHeader = req.headers["authorization"];
    const token = tokenHeader && tokenHeader.split(" ")[1];
    if (!token) {
        res.status(400).send("Access denied: Missing token");
        return;
    }
    if (process.env.ACCESS_TOKEN_SECRET === undefined) {
        res.status(500).send("Server error: Missing token secret");
        return;
    }
    jsonwebtoken_1.default.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
        if (err) {
            res.status(400).send("Access denied: Invalid token");
        }
        else {
            req.user = { _id: payload._id };
            next();
        }
    });
};
exports.authMiddleware = authMiddleware;
exports.default = { register, login, refresh, logout, };
