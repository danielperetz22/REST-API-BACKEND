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
    process.env.JWT_SECRET = 'your_secret_key';
    app = await (0, server_1.default)();
    await AuthModel_1.default.deleteMany({});
});
afterAll(async () => {
    await mongoose_1.default.connection.close();
});
const userInfo = {
    username: "daniel",
    email: "daniel@gmail.com",
    password: "123456"
};
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
describe('Auth Tests', () => {
    let accessToken;
    let refreshToken;
    beforeEach(async () => {
        await (0, supertest_1.default)(app).post("/auth/register").send(userInfo);
        const loginResponse = await (0, supertest_1.default)(app).post("/auth/login").send(userInfo);
        accessToken = loginResponse.body.accessToken;
        refreshToken = loginResponse.body.refreshToken;
    });
    test('Auth Register', async () => {
        const response = await (0, supertest_1.default)(app).post('/auth/register').send({
            username: 'yohai',
            email: 'yohai@gmail.com',
            password: 'yohai123',
        });
        console.log(response.body);
        expect(response.status).toBe(201);
        const user = await AuthModel_1.default.findOne({ email: userInfo.email });
        expect(user).not.toBeNull();
    });
    test("Auth Register with existing email", async () => {
        const response = await (0, supertest_1.default)(app).post("/auth/register").send({
            username: "newuser",
            email: userInfo.email,
            password: "password123",
        });
        expect(response.status).toBe(400);
        expect(response.body.error).toBe("Email is already in use");
    });
    test('Auth Register with existing username', async () => {
        const response = await (0, supertest_1.default)(app).post("/auth/register").send({
            username: userInfo.username,
            email: "newemail@example.com",
            password: "password123",
        });
        expect(response.status).toBe(400);
        expect(response.body.error).toBe("Username already in use");
    });
    test('Auth Register without username', async () => {
        const response = await (0, supertest_1.default)(app).post('/auth/register').send({
            username: '',
            email: 'newemail@gmail.com',
            password: '123456',
        });
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('All fields (username, email, and password) are required');
    });
    test('Auth Register without password', async () => {
        const response = await (0, supertest_1.default)(app).post('/auth/register').send({
            username: 'dadas',
            email: 'newemail',
            password: '',
        });
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('All fields (username, email, and password) are required');
    });
    test('Auth Register without email', async () => {
        const response = await (0, supertest_1.default)(app).post('/auth/register').send({
            username: 'dadas',
            email: '',
            password: '123456',
        });
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('All fields (username, email, and password) are required');
    });
    test('Registration fails when required fields are missing', async () => {
        const response = await (0, supertest_1.default)(app).post('/auth/register').send({
            username: 'testuser',
        });
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('All fields (username, email, and password) are required');
    });
    test('Auth Login with valid username and password', async () => {
        await (0, supertest_1.default)(app).post('/auth/register').send(userInfo);
        const response = await (0, supertest_1.default)(app).post('/auth/login').send({
            username: userInfo.username,
            password: userInfo.password,
        });
        expect(response.status).toBe(200);
        expect(response.body.accessToken).not.toBeNull();
    });
    test('Auth Login with valid email and password', async () => {
        await (0, supertest_1.default)(app).post('/auth/register').send(userInfo);
        const response = await (0, supertest_1.default)(app).post('/auth/login').send({
            email: userInfo.email,
            password: userInfo.password,
        });
        expect(response.status).toBe(200);
        expect(response.body.accessToken).not.toBeNull();
    });
    test('Auth Login with non-existing email', async () => {
        await (0, supertest_1.default)(app).post('/auth/register').send(userInfo);
        const response = await (0, supertest_1.default)(app).post('/auth/login').send({
            email: "don@gmail.com",
            password: userInfo.password,
        });
        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Invalid username, email, or password");
    });
    test('Auth Login with non-existing username', async () => {
        const response = await (0, supertest_1.default)(app).post('/auth/login').send({
            username: 'nonexistent',
            password: userInfo.password
        });
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Invalid username, email, or password');
    });
    test('Auth Login with invalid password', async () => {
        await (0, supertest_1.default)(app).post('/auth/register').send(userInfo);
        const response = await (0, supertest_1.default)(app).post('/auth/login').send({
            email: userInfo.email,
            password: 'wrongpassword'
        });
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Invalid username, email, or password');
    });
    test('Login fails when username or email and password are missing', async () => {
        const response = await (0, supertest_1.default)(app).post('/auth/login').send({
            username: 'testuser',
        });
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Username or email and password are required');
    });
    test('Login fails with invalid username or email', async () => {
        const response = await (0, supertest_1.default)(app).post('/auth/login').send({
            username: 'nonexistentuser',
            email: 'nonexistent@example.com',
            password: '123456',
        });
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Invalid username, email, or password');
    });
    test('Login fails with invalid password', async () => {
        await AuthModel_1.default.deleteMany({});
        await (0, supertest_1.default)(app).post('/auth/register').send({
            username: 'testuser',
            email: 'test@example.com',
            password: 'correctpassword',
        });
        const response = await (0, supertest_1.default)(app).post('/auth/login').send({
            username: 'testuser',
            password: 'wrongpassword',
        });
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Invalid username, email, or password');
    });
    test("Refresh tokens - valid refresh token", async () => {
        const response = await (0, supertest_1.default)(app)
            .post("/auth/refresh")
            .send({ refreshToken });
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("accessToken");
        expect(response.body).toHaveProperty("refreshToken");
        expect(response.body.refreshToken).not.toBe(refreshToken); // Ensure a new refresh token is issued
    });
    test("Refresh tokens - invalid refresh token", async () => {
        const invalidToken = "invalidToken123";
        const response = await (0, supertest_1.default)(app)
            .post("/auth/refresh")
            .send({ refreshToken: invalidToken });
        expect(response.status).toBe(400);
        expect(response.text).toBe("error");
    });
    test("Logout - valid refresh token", async () => {
        const response = await (0, supertest_1.default)(app)
            .post("/auth/logout")
            .send({ refreshToken });
        expect(response.status).toBe(200);
        expect(response.text).toBe("logged out");
        const refreshResponse = await (0, supertest_1.default)(app)
            .post("/auth/refresh")
            .send({ refreshToken });
        expect(refreshResponse.status).toBe(400);
        expect(refreshResponse.text).toBe("error");
    });
    test("Logout - invalid refresh token", async () => {
        const invalidToken = "invalidToken123";
        const response = await (0, supertest_1.default)(app)
            .post("/auth/logout")
            .send({ refreshToken: invalidToken });
        expect(response.status).toBe(400);
        expect(response.text).toBe("error");
    });
});
