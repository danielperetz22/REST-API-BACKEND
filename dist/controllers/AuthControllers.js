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
    if (!process.env.ACCESS_TOKEN_SECRET) {
        console.error("Missing ACCESS_TOKEN_SECRET environment variable.");
        return null;
    }
    const rand = Math.random();
    const accessToken = jsonwebtoken_1.default.sign({ _id: _id, rand: rand }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.TOKEN_EXPIRATION || '1h' } // שימוש ישיר במחרוזת
    );
    const refreshToken = jsonwebtoken_1.default.sign({ _id: _id, rand: rand }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRATION || '7d' } // שימוש ישיר במחרוזת
    );
    return { refreshToken, accessToken };
};
const register = async (req, res) => {
    var _a;
    const { email, password, username } = req.body;
    const profileImage = ((_a = req.file) === null || _a === void 0 ? void 0 : _a.path) || "";
    if (!email || typeof email !== "string") {
        res.status(400).json({ message: "Email is required and must be a string" });
        return;
    }
    if (!password || typeof password !== "string") {
        res.status(400).json({ message: "Password is required and must be a string" });
        return;
    }
    if (!username || typeof username !== "string") { // דרישת שם משתמש
        res.status(400).json({ message: "Username is required and must be a string" });
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
            username,
            password: hashedPassword,
            profileImage,
        });
        res.status(201).json({
            message: "User registered successfully",
            user: {
                _id: user._id,
                email: user.email,
                username: user.username,
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
        if (!refreshToken) {
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
            if (!userId) {
                reject("error");
                return;
            }
            try {
                const user = await AuthModel_1.default.findById(userId);
                if (!user) {
                    reject("error");
                    return;
                }
                if (!user.refeshtokens || !user.refeshtokens.includes(refreshToken)) {
                    reject("error");
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
        user.refeshtokens = user.refeshtokens.filter((token) => token !== req.body.refreshToken);
        await user.save();
        res.status(200).send("logged out");
    }
    catch (err) {
        res.status(400).send("error");
        return;
    }
};
const authMiddleware = async (req, res, next) => {
    const tokenHeader = req.headers["authorization"];
    const token = tokenHeader && tokenHeader.split(" ")[1];
    if (!token) {
        res.status(400).send("Access denied: Missing token");
        return;
    }
    if (!process.env.ACCESS_TOKEN_SECRET) {
        res.status(500).send("Server error: Missing token secret");
        return;
    }
    jsonwebtoken_1.default.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, payload) => {
        if (err) {
            res.status(400).send("Access denied: Invalid token");
            return;
        }
        try {
            const user = await AuthModel_1.default.findById(payload._id).select("_id email");
            if (!user) {
                res.status(404).send("User not found");
                return;
            }
            req.user = { _id: user._id, email: user.email };
            next();
        }
        catch (error) {
            res.status(500).send("Server error");
        }
    });
};
exports.authMiddleware = authMiddleware;
const googleLoginOrRegister = async (req, res) => {
    const { token } = req.body;
    try {
        console.log("Received token:", token);
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        if (!payload) {
            console.log("Invalid Google token");
            res.status(400).json({ message: "Invalid Google token." });
            return;
        }
        console.log("Google payload:", payload);
        const { email, name, picture } = payload;
        if (!email) {
            console.log("Email is missing in Google payload");
            res.status(400).json({ message: "Google account email is required." });
            return;
        }
        let user = await AuthModel_1.default.findOne({ email });
        if (!user) {
            console.log("Creating new user for email:", email);
            user = await AuthModel_1.default.create({
                email,
                username: name || email,
                password: "",
                profileImage: picture || "",
            });
        }
        const tokens = generateTokens(user._id);
        if (!tokens) {
            console.log("Failed to generate tokens");
            res.status(500).json({ message: "Failed to generate tokens." });
            return;
        }
        if (!user.refeshtokens) {
            user.refeshtokens = [];
        }
        user.refeshtokens.push(tokens.refreshToken);
        await user.save();
        res.status(200).json(Object.assign(Object.assign({}, tokens), { user: {
                _id: user._id,
                email: user.email,
                username: user.username,
                profileImage: user.profileImage,
            } }));
    }
    catch (error) {
        console.error("Error during Google login/register:", error);
        res.status(500).json({ message: "Error logging in/registering with Google.", error });
    }
};
const getUserProfile = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            res.status(400).json({ message: "Invalid user ID" });
            return;
        }
        const user = await AuthModel_1.default.findById(req.user._id);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        const profileImageUrl = user.profileImage
            ? `http://localhost:3000/${user.profileImage.replace(/\\/g, "/")}`
            : "https://example.com/default-avatar.jpg";
        res.status(200).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            profileImage: profileImageUrl,
        });
    }
    catch (err) {
        console.error("Error getting user profile:", err);
        res.status(500).json({ message: "Internal server error", error: err });
    }
};
const updateUserProfile = async (req, res) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        if (!userId) {
            console.log("Error: No user ID found in request");
            res.status(400).json({ message: "Invalid user ID" });
            return;
        }
        const currentUser = await AuthModel_1.default.findById(userId);
        if (!currentUser) {
            console.log("User not found in DB");
            res.status(404).json({ message: "User not found" });
            return;
        }
        const { username, email, oldPassword, confirmNewPassword, newPassword } = req.body;
        const updates = {};
        if (username && username.trim() !== "") {
            updates.username = username.trim();
        }
        if (req.file) {
            const profileImagePath = `uploads/${req.file.filename}`;
            updates.profileImage = profileImagePath;
        }
        if (email && email.trim() !== "") {
            const newEmail = email.trim();
            if (newEmail != currentUser.email) {
                const userWithSameEmail = await AuthModel_1.default.findOne({ email: newEmail });
                if (userWithSameEmail && userWithSameEmail._id !== userId) {
                    res.status(400).json({ message: "Email already in use" });
                    return;
                }
                updates.email = newEmail;
            }
        }
        if (newPassword && newPassword.trim() !== "") {
            if (newPassword !== confirmNewPassword) {
                res.status(400).json({ message: "New passwords do not match" });
                return;
            }
            const hasLocalPassword = currentUser.password && currentUser.password.trim() !== "";
            if (hasLocalPassword) {
                if (!oldPassword) {
                    res.status(400).json({ message: "Old password is required to change password" });
                    return;
                }
                const isMatch = await bcrypt_1.default.compare(oldPassword, currentUser.password);
                if (!isMatch) {
                    res.status(400).json({ message: "Incorrect old password" });
                    return;
                }
            }
            const salt = await bcrypt_1.default.genSalt(10);
            const hashedPassword = await bcrypt_1.default.hash(newPassword.trim(), salt);
            updates.password = hashedPassword;
        }
        if (Object.keys(updates).length === 0) {
            res.status(400).json({ message: "No updates provided" });
            return;
        }
        const updatedUser = await AuthModel_1.default.findByIdAndUpdate(userId, { $set: updates }, { new: true, runValidators: true });
        if (!updatedUser) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        const profileImageUrl = updatedUser.profileImage
            ? `http://localhost:3000/${updatedUser.profileImage.replace(/\\/g, "/")}`
            : null;
        const response = {
            message: "User profile updated successfully",
            user: {
                _id: updatedUser._id,
                email: updatedUser.email,
                username: updatedUser.username,
                profileImage: profileImageUrl
            }
        };
        res.status(200).json(response);
    }
    catch (err) {
        console.error("Error in updateUserProfile:", err);
        res.status(500).json({
            message: "Internal server error",
            error: err instanceof Error ? err.message : String(err)
        });
    }
};
exports.default = { register, login, refresh, logout, googleLoginOrRegister, getUserProfile, updateUserProfile };
