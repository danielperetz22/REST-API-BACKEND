"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const AuthModel_1 = __importDefault(require("../models/AuthModel"));
const google_auth_library_1 = require("google-auth-library");
const client = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID);
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
    var _a;
    const { username, email, password } = req.body;
    const profileImage = ((_a = req.file) === null || _a === void 0 ? void 0 : _a.path) || "";
    if (!username || typeof username !== "string") {
        res.status(400).json({ message: "Username is required and must be a string" });
        return;
    }
    if (!email || typeof email !== "string") {
        res.status(400).json({ message: "Email is required and must be a string" });
        return;
    }
    if (!password || typeof password !== "string") {
        res.status(400).json({ message: "Password is required and must be a string" });
        return;
    }
    try {
        const existingUser = await AuthModel_1.default.findOne({
            $or: [{ username }, { email }],
        });
        if (existingUser) {
            const errorMessage = existingUser.email === email
                ? "Email already in use"
                : "Username already in use";
            res.status(400).json({ error: errorMessage });
            return;
        }
        const salt = await bcrypt_1.default.genSalt(10);
        const hashedPassword = await bcrypt_1.default.hash(password, salt);
        const user = await AuthModel_1.default.create({
            username,
            email,
            password: hashedPassword,
            profileImage,
        });
        res.status(201).json({
            message: "User registered successfully",
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                profileImage: user.profileImage,
            },
        });
        return;
    }
    catch (err) {
        console.error("Error in register:", err);
        res.status(500).json({ message: "Internal server error", error: err });
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
const googleLogin = async (req, res) => {
    const { token } = req.body;
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        if (!payload) {
            res.status(400).json({ message: "Invalid Google token." });
            return;
        }
        const { email, name, picture } = payload;
        let user = await AuthModel_1.default.findOne({ email });
        if (!user) {
            user = await AuthModel_1.default.create({
                username: name,
                email,
                password: "",
                profileImage: picture,
            });
        }
        const tokens = generateTokens(user._id);
        if (!tokens) {
            res.status(500).json({ message: "Failed to generate tokens." });
            return;
        }
        res.status(200).json(Object.assign(Object.assign({}, tokens), { user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                profileImage: user.profileImage,
            } }));
    }
    catch (error) {
        res.status(500).json({ message: "Error logging in with Google.", error });
    }
};
exports.default = { register, login, refresh, logout, googleLogin };
