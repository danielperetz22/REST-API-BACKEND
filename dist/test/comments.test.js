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
let app;
let commentId = "";
const testComment = {
    content: "This is a test comment",
    owner: "Test owner",
    postId: "",
};
const invalidComment = {
    content: "",
    owner: "",
};
const userInfo = {
    email: "hila@gmail.com",
    username: "hila",
    password: "123456"
};
beforeAll(async () => {
    app = await (0, server_1.default)();
    await PostModel_1.default.deleteMany();
    await CommentModel_1.default.deleteMany();
    await (0, supertest_1.default)(app).post("/auth/register").send(userInfo);
    const response = await (0, supertest_1.default)(app).post("/auth/login").send(userInfo);
    userInfo._id = response.body._id || response.body._Id;
    userInfo.accessToken = response.body.accessToken;
    userInfo.refreshToken = response.body.refreshToken;
    const postResponse = await (0, supertest_1.default)(app).post("/post").set({ Authorization: "jwt " + userInfo.accessToken })
        .send({ title: "test post", content: "test content" });
    testComment.postId = postResponse.body._id;
});
afterAll(async () => {
    await mongoose_1.default.connection.close();
});
describe("Comment Tests", () => {
    test("Fetch all comments - initially empty", async () => {
        const response = await (0, supertest_1.default)(app).get("/comment");
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveLength(0);
    });
    test("Create a new comment", async () => {
        const response = await (0, supertest_1.default)(app).post("/comment").set({
            Authorization: "jwt " + userInfo.accessToken,
        }).send(testComment);
        expect(response.statusCode).toBe(201);
        expect(response.body.content).toBe(testComment.content);
        expect(response.body.owner).toBe(testComment.owner);
        expect(response.body.postId).toBe(testComment.postId);
        commentId = response.body._id;
    });
    test("Create comment fails with missing fields", async () => {
        const response = await (0, supertest_1.default)(app).post("/comment").send(invalidComment);
        expect(response.statusCode).toBe(400);
    });
    test("Fetch all comments after creation", async () => {
        const response = await (0, supertest_1.default)(app).get("/comment");
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveLength(1);
    });
    test("Create comment fails with missing fields", async () => {
        const response = await (0, supertest_1.default)(app).post("/comment").send(invalidComment);
        expect(response.statusCode).toBe(400);
    });
    test("Fetch comment by ID", async () => {
        const response = await (0, supertest_1.default)(app).get(`/comment/${commentId}`);
        expect(response.statusCode).toBe(200);
        expect(response.body._id).toBe(commentId);
        expect(response.body._id).toBe(commentId);
        expect(response.body.content).toBe(testComment.content);
    });
    test("Update comment", async () => {
        const response = await (0, supertest_1.default)(app)
            .put(`/comment/${commentId}`).set("Authorization", "jwt " + userInfo.accessToken)
            .send({ comment: "Updated comment content" });
        expect(response.statusCode).toBe(200);
        expect(response.body.content).toBe("Updated comment content");
    });
    test("Delete a comment by ID", async () => {
        const response = await (0, supertest_1.default)(app).delete(`/comment/${commentId}`);
        expect(response.statusCode).toBe(200);
    });
    test("Attempt to fetch a non-existing comment by ID", async () => {
        const fakeId = new mongoose_1.default.Types.ObjectId().toString();
        const response = await (0, supertest_1.default)(app).get(`/comment/${fakeId}`);
        expect(response.statusCode).toBe(404);
        expect(response.text).toBe("COULDNT FIND DUE TO AN ERROR");
    });
    test("Attempt to update a non-existing comment", async () => {
        const fakeId = new mongoose_1.default.Types.ObjectId().toString();
        const response = await (0, supertest_1.default)(app)
            .put(`/comment/${fakeId}`)
            .send({ comment: "Updated content" });
        expect(response.statusCode).toBe(404);
        expect(response.text).toBe("COULD NOT UPDATE COMMENT DUE TO AN ERROR!");
    });
    test("Attempt to delete a non-existing comment", async () => {
        const fakeId = new mongoose_1.default.Types.ObjectId().toString();
        const response = await (0, supertest_1.default)(app).delete(`/comment/${fakeId}`);
        expect(response.statusCode).toBe(404);
        expect(response.text).toBe("Could not delete comment due to an error");
    });
    test("Get all comments by postId none found", async () => {
        const response = await (0, supertest_1.default)(app).get("/comment?postId=nonExistingPost123");
        expect(response.statusCode).toBe(400);
        expect(response.text).toBe("There are not comments on this post");
    });
    test("Get all comments by postId some found", async () => {
        const postId = "myTestPost123";
        const newComment = await CommentModel_1.default.create({
            content: "Hello from postId test!",
            owner: "Test owner",
            postId,
        });
        const response = await (0, supertest_1.default)(app).get(`/comment?postId=${postId}`);
        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBe(1);
        expect(response.body[0]._id).toBe(newComment._id.toString());
    });
});
