"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const server_1 = __importDefault(require("../server"));
const mongoose_1 = __importDefault(require("mongoose"));
const AuthModel_1 = __importDefault(require("../models/AuthModel"));
let app;
beforeAll(async () => {
    process.env.ACCESS_TOKEN_SECRET = "your_secret_key";
    process.env.REFRESH_TOKEN_EXPIRATION = "7d";
    app = await (0, server_1.default)();
    await AuthModel_1.default.deleteMany({});
});
afterAll(async () => {
    await mongoose_1.default.connection.close();
});
const userInfo = {
    username: "daniel",
    email: "daniel@gmail.com",
    password: "123456",
};
describe("Auth API Tests", () => {
    let accessToken;
    let refreshToken;
    beforeEach(async () => {
        await (0, supertest_1.default)(app).post("/auth/register").send(userInfo);
        const loginResponse = await (0, supertest_1.default)(app).post("/auth/login").send(userInfo);
        accessToken = loginResponse.body.accessToken;
        refreshToken = loginResponse.body.refreshToken;
    });
    /**
     * ✅ Register Tests
     */
    test("Should register a new user", async () => {
        const response = await (0, supertest_1.default)(app).post("/auth/register").send({
            username: "yohai",
            email: "yohai@gmail.com",
            password: "yohai123",
        });
        expect(response.status).toBe(201);
        expect(response.body.message).toBe("User registered successfully");
        const user = await AuthModel_1.default.findOne({ email: "yohai@gmail.com" });
        expect(user).not.toBeNull();
    });
    test("Should not allow duplicate email registration", async () => {
        const response = await (0, supertest_1.default)(app).post("/auth/register").send({
            username: "testUser",
            email: userInfo.email,
            password: "password123",
        });
        expect(response.status).toBe(400);
        expect(response.body.error).toBe("Email already in use");
    });
    test("Should return an error when missing required fields", async () => {
        const response = await (0, supertest_1.default)(app).post("/auth/register").send({
            username: "testuser",
        });
        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Email is required and must be a string");
    });
    /**
     * ✅ Login Tests
     */
    test("Should login with valid email and password", async () => {
        const response = await (0, supertest_1.default)(app).post("/auth/login").send({
            email: userInfo.email,
            password: userInfo.password,
        });
        expect(response.status).toBe(200);
        expect(response.body.accessToken).not.toBeNull();
    });
    test("Should return error for non-existing email", async () => {
        const response = await (0, supertest_1.default)(app).post("/auth/login").send({
            email: "nonexistent@gmail.com",
            password: userInfo.password,
        });
        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Invalid email or password");
    });
    test("Should return error for incorrect password", async () => {
        const response = await (0, supertest_1.default)(app).post("/auth/login").send({
            email: userInfo.email,
            password: "wrongpassword",
        });
        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Invalid email or password");
    });
    /**
     * ✅ Token Tests
     */
    test("Should refresh tokens with valid refresh token", async () => {
        const response = await (0, supertest_1.default)(app)
            .post("/auth/refresh")
            .send({ refreshToken });
        expect(response.status).toBe(200);
        expect(response.body.accessToken).not.toBe(refreshToken);
    });
    test("Should return error for invalid refresh token", async () => {
        const response = await (0, supertest_1.default)(app)
            .post("/auth/refresh")
            .send({ refreshToken: "invalidToken123" });
        expect(response.status).toBe(400);
        expect(response.text).toBe("error");
    });
    /**
     * ✅ Logout Tests
     */
    test("Should logout and invalidate refresh token", async () => {
        const response = await (0, supertest_1.default)(app).post("/auth/logout").send({ refreshToken });
        expect(response.status).toBe(200);
        expect(response.text).toBe("logged out");
        const refreshResponse = await (0, supertest_1.default)(app)
            .post("/auth/refresh")
            .send({ refreshToken });
        expect(refreshResponse.status).toBe(400);
        expect(refreshResponse.text).toBe("error");
    });
    test("Should return error for invalid refresh token during logout", async () => {
        const response = await (0, supertest_1.default)(app).post("/auth/logout").send({
            refreshToken: "invalidToken123",
        });
        expect(response.status).toBe(400);
        expect(response.text).toBe("error");
    });
    /**
     * ✅ Protected Route Tests
     */
    test("Should return error when accessing protected route without token", async () => {
        const response = await (0, supertest_1.default)(app).get("/auth/testAuth");
        expect(response.status).toBe(400);
        expect(response.text).toBe("Access denied: Missing token");
    });
    test("Should return error for invalid token", async () => {
        const response = await (0, supertest_1.default)(app)
            .get("/auth/testAuth")
            .set("Authorization", "Bearer invalidToken123");
        expect(response.status).toBe(400);
        expect(response.text).toBe("Access denied: Invalid token");
    });
    test("Should pass authentication with valid token", async () => {
        const loginResponse = await (0, supertest_1.default)(app).post("/auth/login").send(userInfo);
        const validToken = loginResponse.body.accessToken;
        const response = await (0, supertest_1.default)(app)
            .get("/auth/testAuth")
            .set("Authorization", "Bearer " + validToken);
        expect(response.status).toBe(200);
        expect(response.body.message).toBe("You are authenticated");
    });
});
