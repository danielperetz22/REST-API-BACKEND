"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const server_1 = __importDefault(require("../server"));
const mongoose_1 = __importDefault(require("mongoose"));
const PostModel_1 = __importDefault(require("../models/PostModel"));
let app;
let postId = '';
const userInfo = {
    email: "hila@gmail.com",
    username: "hila",
    password: "123456"
};
beforeAll(async () => {
    app = await (0, server_1.default)();
    await PostModel_1.default.deleteMany();
    // await AuthModel.deleteMany();
    await (0, supertest_1.default)(app).post("/auth/register").send(userInfo);
    const response = await (0, supertest_1.default)(app).post("/auth/login").send(userInfo);
    userInfo._id = response.body._id || response.body._Id;
    userInfo.accessToken = response.body.accessToken;
    userInfo.refreshToken = response.body.refreshToken;
});
afterAll(async () => {
    await mongoose_1.default.connection.close();
});
describe("Posts test suite", () => {
    test("Test get all post - empty", async () => {
        const response = await (0, supertest_1.default)(app).get("/post/all");
        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(0);
    });
    test("Test create post", async () => {
        const response = await (0, supertest_1.default)(app).post("/post").set({
            Authorization: "jwt " + userInfo.accessToken,
        })
            .send({
            title: "title",
            content: "content",
        });
        postId = response.body._id;
        expect(response.status).toBe(201);
        expect(response.body.title).toBe("title");
        expect(response.body.content).toBe("content");
        expect(response.body.owner).toBe(userInfo._id);
    });
    test("Test fail to create post", async () => {
        const response = await (0, supertest_1.default)(app).post("/post").set({
            Authorization: "jwt " + userInfo.accessToken,
        })
            .send({
            title: "title",
        });
        expect(response.status).toBe(400);
    });
    test("Test get all post after adding post", async () => {
        const response = await (0, supertest_1.default)(app).get("/post/all");
        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(1);
    });
    test("Test get post by id", async () => {
        const response = await (0, supertest_1.default)(app).get(`/post/` + postId);
        expect(response.status).toBe(200);
        expect(response.body.title).toBe("title");
        expect(response.body.content).toBe("content");
        expect(response.body.owner).toBe(userInfo._id);
    });
    test("Test fail to get post by id", async () => {
        const response = await (0, supertest_1.default)(app).get(`/post/` + postId + 5);
        expect(response.status).toBe(400);
    });
    test("Test get post by owner", async () => {
        const response = await (0, supertest_1.default)(app).get(`/post/all?owner=${userInfo._id}`);
        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(1);
    });
    test("Test fail to get post by owner", async () => {
        const response = await (0, supertest_1.default)(app).get(`/post/all?owner=123456`);
        expect(response.status).toBe(404);
    });
    test("Test update post", async () => {
        const response = await (0, supertest_1.default)(app).put(`/post/` + postId).set({
            Authorization: "jwt " + userInfo.accessToken,
        })
            .send({
            title: "updated title",
            content: "updated content",
        });
        expect(response.status).toBe(200);
        expect(response.body.title).toBe("updated title");
        expect(response.body.content).toBe("updated content");
    });
    test("Test update post with non-existing ID'", async () => {
        const fakeId = new mongoose_1.default.Types.ObjectId().toString();
        const response = await (0, supertest_1.default)(app)
            .put(`/post/${fakeId}`)
            .set("Authorization", "jwt " + userInfo.accessToken)
            .send({
            title: "Doesn't matter",
            content: "Because post is not found",
        });
        expect(response.status).toBe(404);
        expect(response.text).toBe("could not find post");
    });
    test("Test fail to update post", async () => {
        const response = await (0, supertest_1.default)(app).put(`/post/` + postId).set({
            Authorization: "jwt " + userInfo.accessToken,
        })
            .send({
            title: "updated title",
        });
        expect(response.status).toBe(400);
    });
});
