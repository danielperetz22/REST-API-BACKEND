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
const supertest_1 = __importDefault(require("supertest"));
const server_1 = __importDefault(require("../server"));
const AuthModel_1 = __importDefault(require("../models/AuthModel"));
let app;
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    process.env.JWT_SECRET = 'your_secret_key';
    app = yield (0, server_1.default)();
    yield AuthModel_1.default.deleteMany({});
}));
const userInfo = {
    username: "daniel",
    email: "daniel@gmail.com",
    password: "123456"
};
describe('Auth Tests', () => {
    test('Auth Register', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).post('/auth/register').send(userInfo);
        console.log(response.body);
        expect(response.status).toBe(201);
    }));
    test('Auth Login Tests', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).post('/auth/login').send(userInfo);
        console.log(response.body);
        expect(response.status).toBe(200);
        const token = response.body.token;
        expect(token).not.toBeNull();
        const userId = response.body._id;
        expect(userId).not.toBeNull();
        userInfo.token = token;
        userInfo._id = userId;
    }));
    test('Create post without auth', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).post("/post").send({
            title: "My first post",
            content: "this is my first post",
            owner: userInfo._id,
        });
        console.log(response.body);
        expect(response.status).toBe(401);
    }));
    test('Create post with auth', () => __awaiter(void 0, void 0, void 0, function* () {
        const response2 = yield (0, supertest_1.default)(app).post("/post").set({
            authorization: 'Bearer ' + userInfo.token,
        }).send({
            title: "My first post",
            content: "this is my first post",
            owner: userInfo._id,
        });
        expect(response2.status).toBe(201);
    }));
});
