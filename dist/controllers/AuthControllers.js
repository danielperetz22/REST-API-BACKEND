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
    const { email, password } = req.body;
    const profileImage = ((_a = req.file) === null || _a === void 0 ? void 0 : _a.path) || "";
    if (!email || typeof email !== "string") {
        res.status(400).json({ message: "Email is required and must be a string" });
        return;
    }
    if (!password || typeof password !== "string") {
        res.status(400).json({ message: "Password is required and must be a string" });
        return;
    }
    try {
        const existingUser = await AuthModel_1.default.findOne({ email });
        if (existingUser) {
            res.status(400).json({ error: "Email already in use" });
            return;
        }
        const salt = await bcrypt_1.default.genSalt(10);
        const hashedPassword = await bcrypt_1.default.hash(password, salt);
        const user = await AuthModel_1.default.create({
            email,
            password: hashedPassword,
            profileImage,
        });
        res.status(201).json({
            message: "User registered successfully",
            user: {
                _id: user._id,
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
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            res.status(400).json({ message: "email and password are required" });
            return;
        }
        const user = await AuthModel_1.default.findOne({ email });
        if (!user) {
            res.status(400).json({ message: "Invalid email, or password" });
            return;
        }
        const validPassword = await bcrypt_1.default.compare(password, user.password);
        if (!validPassword) {
            res.status(400).json({ message: "Invalid email, or password" });
            return;
        }
        const tokens = generateTokens(user._id);
        if (!tokens) {
            res.status(500).json({ message: "Failed to generate tokens" });
            return;
        }
        if (!user.refeshtokens) {
            user.refeshtokens = [];
        }
        user.refeshtokens.push(tokens.refreshToken);
        await user.save();
        res.status(200).json(Object.assign(Object.assign({}, tokens), { _id: user._id }));
    }
    catch (err) {
        console.error("Error during login:", err);
        res.status(500).json({ message: "Error during login", error: err });
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
const googleLoginOrRegister = async (req, res) => {
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
        if (!email) {
            res.status(400).json({ message: "Google account email is required." });
            return;
        }
        // חפש משתמש לפי אימייל
        let user = await AuthModel_1.default.findOne({ email });
        if (!user) {
            // משתמש חדש: יצירת משתמש רק עם המידע שמגיע מגוגל
            user = await AuthModel_1.default.create({
                email,
                password: "", // לא נדרשת סיסמה
                profileImage: picture || "",
            });
        }
        // יצירת טוקנים
        const tokens = generateTokens(user._id);
        if (!tokens) {
            res.status(500).json({ message: "Failed to generate tokens." });
            return;
        }
        res.status(200).json(Object.assign(Object.assign({}, tokens), { user: {
                _id: user._id,
                email: user.email,
                profileImage: user.profileImage,
            } }));
    }
    catch (error) {
        console.error("Error during Google login/register:", error);
        res.status(500).json({ message: "Error logging in/registering with Google.", error });
    }
};
exports.default = { register, login, refresh, logout, googleLoginOrRegister };
