"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const server_1 = __importDefault(require("../server"));
const mongoose_1 = __importDefault(require("mongoose"));
const CommentModel_1 = __importDefault(require("../models/CommentModel"));
const PostModel_1 = __importDefault(require("../models/PostModel"));
const AuthModel_1 = __importDefault(require("../models/AuthModel"));
let app;
let commentId = "";
let postId = "";
const testComment = {
    content: "This is a test comment",
    postId: "",
};
const userInfo = {
    email: "testuser@gmail.com",
    username: "testuser",
    password: "testpassword",
};
beforeAll(async () => {
    app = await (0, server_1.default)();
    // Clean DB
    await PostModel_1.default.deleteMany();
    await CommentModel_1.default.deleteMany();
    await AuthModel_1.default.deleteMany();
    // 1) Register & Login user
    await (0, supertest_1.default)(app).post("/auth/register").send(userInfo);
    const response = await (0, supertest_1.default)(app).post("/auth/login").send(userInfo);
    userInfo._id = response.body._id;
    userInfo.accessToken = response.body.accessToken;
    userInfo.refreshToken = response.body.refreshToken;
    // 2) Create a test post
    const postResponse = await (0, supertest_1.default)(app)
        .post("/post")
        .set("Authorization", "Bearer " + userInfo.accessToken)
        .send({ title: "Test Post", content: "Test Post Content" });
    postId = postResponse.body._id;
    testComment.postId = postId;
    console.log("Created Post ID:", postId);
});
afterAll(async () => {
    await mongoose_1.default.connection.close();
});
describe("🚀 Comments API Tests", () => {
    test("GET /comment - returns an empty list initially", async () => {
        const response = await (0, supertest_1.default)(app).get("/comment");
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual([]);
    });
    test("POST /comment - creates a new comment", async () => {
        const response = await (0, supertest_1.default)(app)
            .post("/comment")
            .set("Authorization", "Bearer " + userInfo.accessToken)
            .send({
            content: "Test Comment",
            postId: postId,
        });
        console.log("✅ Created Comment Response:", response.body);
        commentId = response.body.newComment._id;
        expect(response.status).toBe(201);
        expect(commentId).toBeDefined();
    });
    test("POST /comment - fails with missing fields", async () => {
        const response = await (0, supertest_1.default)(app)
            .post("/comment")
            .set("Authorization", "Bearer " + userInfo.accessToken)
            .send({ content: "" });
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe("Content and postId are required");
    });
    test("GET /comment - returns all comments after creation", async () => {
        const response = await (0, supertest_1.default)(app).get("/comment");
        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBeGreaterThan(0);
    });
    test("GET /comment/:id - retrieves a comment by ID", async () => {
        const response = await (0, supertest_1.default)(app).get(`/comment/${commentId}`);
        expect(response.statusCode).toBe(200);
        expect(response.body._id).toBe(commentId);
    });
    test("GET /comment?postId=:postId - retrieves comments by post ID", async () => {
        const response = await (0, supertest_1.default)(app).get(`/comment?postId=${postId}`);
        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBeGreaterThan(0);
    });
    test("PUT /comment/:id - fails with invalid token", async () => {
        const response = await (0, supertest_1.default)(app)
            .put(`/comment/${commentId}`)
            .set("Authorization", "Bearer invalidToken")
            .send({ comment: "Should not update" });
        expect([400, 401]).toContain(response.statusCode);
    });
    test("PUT /comment/:id - returns 404 when updating non-existing comment", async () => {
        const fakeId = new mongoose_1.default.Types.ObjectId().toString();
        const response = await (0, supertest_1.default)(app)
            .put(`/comment/${fakeId}`)
            .set("Authorization", "Bearer " + userInfo.accessToken)
            .send({ comment: "Should not work" });
        expect(response.statusCode).toBe(404);
        expect(response.body.message).toBe("Comment not found");
    });
    test("DELETE /comment/:id - returns 404 when deleting non-existing comment", async () => {
        const fakeId = new mongoose_1.default.Types.ObjectId().toString();
        const response = await (0, supertest_1.default)(app)
            .delete(`/comment/${fakeId}`)
            .set("Authorization", "Bearer " + userInfo.accessToken);
        expect(response.statusCode).toBe(404);
        expect(response.body.message).toBe("Comment not found");
    });
});
