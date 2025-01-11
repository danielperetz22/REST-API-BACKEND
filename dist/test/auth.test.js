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
    test('Auth Register', async () => {
        const response = await (0, supertest_1.default)(app).post('/auth/register').send(userInfo);
        expect(response.status).toBe(201);
        const user = await AuthModel_1.default.findOne({ email: userInfo.email });
        expect(user).not.toBeNull();
    });
    test('Auth Register with existing email', async () => {
        await (0, supertest_1.default)(app).post('/auth/register').send(userInfo);
        const response = await (0, supertest_1.default)(app).post('/auth/register').send({
            username: 'dan',
            email: userInfo.email,
            password: '123456',
        });
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Email already in use');
    });
    test('Auth Register with existing username', async () => {
        await (0, supertest_1.default)(app).post('/auth/register').send(userInfo);
        const response = await (0, supertest_1.default)(app).post('/auth/register').send({
            username: userInfo.username,
            email: 'newemail@gmail.com',
            password: '123456',
        });
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Username already in use');
    });
    test('Auth Register without username', async () => {
        const response = await (0, supertest_1.default)(app).post('/auth/register').send({
            username: '',
            email: 'newemail@gmail.com',
            password: '123456',
        });
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Username, email, and password are required');
    });
    test('Auth Register without password', async () => {
        const response = await (0, supertest_1.default)(app).post('/auth/register').send({
            username: 'dadas',
            email: 'newemail',
            password: '',
        });
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Username, email, and password are required');
    });
    test('Auth Register without email', async () => {
        const response = await (0, supertest_1.default)(app).post('/auth/register').send({
            username: 'dadas',
            email: '',
            password: '123456',
        });
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Username, email, and password are required');
    });
    test('Registration fails when required fields are missing', async () => {
        const response = await (0, supertest_1.default)(app).post('/auth/register').send({
            username: 'testuser',
        });
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Username, email, and password are required');
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
    test('Auth Login with non-existing username', async () => {
        const response = await (0, supertest_1.default)(app).post('/auth/login').send({
            username: 'nonexistent',
            password: userInfo.password
        });
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Invalid username or email');
    });
    test('Auth Login with non-existing email', async () => {
        await (0, supertest_1.default)(app).post('/auth/register').send(userInfo);
        const response = await (0, supertest_1.default)(app).post('/auth/login').send({
            email: "don@gmail.com",
            password: userInfo.password,
        });
        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Invalid username or email");
    });
    test('Auth Login with invalid password', async () => {
        await (0, supertest_1.default)(app).post('/auth/register').send(userInfo);
        const response = await (0, supertest_1.default)(app).post('/auth/login').send({
            email: userInfo.email,
            password: 'wrongpassword'
        });
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Invalid password');
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
        expect(response.body.message).toBe('Invalid username or email');
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
        expect(response.body.message).toBe('Invalid password');
    });
    test('Token validation - valid token', async () => {
        await AuthModel_1.default.deleteMany({});
        const registerResponse = await (0, supertest_1.default)(app).post('/auth/register').send(userInfo);
        expect(registerResponse.status).toBe(201);
        const loginResponse = await (0, supertest_1.default)(app).post('/auth/login').send(userInfo);
        expect(loginResponse.status).toBe(200);
        const token = loginResponse.body.accessToken;
        expect(token).not.toBeNull();
        const response = await (0, supertest_1.default)(app).get('/auth/validate').set('Authorization', `Bearer ${token}`);
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Token is valid');
    });
    test('Token validation - not valid token', async () => {
        await AuthModel_1.default.deleteMany({});
        const registerResponse = await (0, supertest_1.default)(app).post('/auth/register').send(userInfo);
        expect(registerResponse.status).toBe(201);
        const loginResponse = await (0, supertest_1.default)(app).post('/auth/login').send(userInfo);
        expect(loginResponse.status).toBe(200);
        const token = 'invalidToken123';
        expect(token).not.toBeNull();
        const response = await (0, supertest_1.default)(app).get('/auth/validate').set('Authorization', `Bearer ${token}`);
        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Invalid or expired token');
    });
    test('Access protected route without token', async () => {
        const response = await (0, supertest_1.default)(app).get('/auth/protected');
        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Authorization token is missing');
    });
    test('Access protected route with invalid token', async () => {
        const response = await (0, supertest_1.default)(app).get('/auth/protected').set('Authorization', 'Bearer invalidToken123');
        expect(response.status).toBe(403);
        expect(response.body.message).toBe('Invalid or expired token');
    });
    test('Token validation - expired token', async () => {
        await AuthModel_1.default.deleteMany({});
        const registerResponse = await (0, supertest_1.default)(app).post('/auth/register').send(userInfo);
        expect(registerResponse.status).toBe(201);
        const loginResponse = await (0, supertest_1.default)(app).post('/auth/login').send(userInfo);
        expect(loginResponse.status).toBe(200);
        const token = loginResponse.body.accessToken;
        expect(token).not.toBeNull();
        const response = await (0, supertest_1.default)(app).get('/auth/validate').set('Authorization', `Bearer ${token}`);
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Token is valid');
        await sleep(6000);
        const response2 = await (0, supertest_1.default)(app).get('/auth/validate').set('Authorization', `Bearer ${token}`);
        expect(response2.status).toBe(401);
        expect(response2.body.message).toBe('Invalid or expired token');
    }, 10000);
    test('Protected route access fails without token', async () => {
        const response = await (0, supertest_1.default)(app).get('/auth/protected');
        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Authorization token is missing');
    });
});
