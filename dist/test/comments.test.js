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
let postId = "";
const testPost = {
    title: "Test title",
    content: "Test content",
    senderId: "Test senderId",
};
const testComment = {
    content: "This is a test comment",
    owner: "Test owner",
};
const invalidComment = {
    content: "",
    owner: "",
};
beforeAll(async () => {
    app = await (0, server_1.default)();
    await PostModel_1.default.deleteMany();
    const post = new PostModel_1.default(testPost);
    const savedPost = await post.save();
    postId = savedPost._id.toString();
});
afterAll(async () => {
    await mongoose_1.default.connection.close();
});
describe("Posts test suite", () => {
    test("Fetch all comments - initially empty", async () => {
        const response = await (0, supertest_1.default)(app).get("/comment/all");
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveLength(0);
    });
    test("Create a new comment", async () => {
        const response = await (0, supertest_1.default)(app).post("/comment").send(Object.assign(Object.assign({}, testComment), { postId }));
        expect(response.statusCode).toBe(201);
        expect(response.body.content).toBe(testComment.content);
        expect(response.body.postId).toBe(postId);
        expect(response.body.owner).toBe(testComment.owner);
        commentId = response.body._id;
    });
    test("Attempt to create an invalid comment", async () => {
        const response = await (0, supertest_1.default)(app).post("/comment").send(invalidComment);
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe("Content, postId, and owner are required");
    });
    test("Create comment fails with missing content", async () => {
        const response = await (0, supertest_1.default)(app).post("/comment").send({ postId, owner: testComment.owner });
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe("Content, postId, and owner are required");
    });
    test("Create comment fails with missing postId", async () => {
        const response = await (0, supertest_1.default)(app).post("/comment").send({ content: testComment.content, owner: testComment.owner });
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe("Content, postId, and owner are required");
    });
    test("Create comment fails with missing owner", async () => {
        const response = await (0, supertest_1.default)(app).post("/comment").send({ content: testComment.content, postId });
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe("Content, postId, and owner are required");
    });
    test("Create comment fails with non-existent postId", async () => {
        const fakePostId = new mongoose_1.default.Types.ObjectId().toString();
        const response = await (0, supertest_1.default)(app).post("/comment").send({ content: testComment.content, postId: fakePostId, owner: testComment.owner });
        expect(response.statusCode).toBe(404);
        expect(response.body.message).toBe("Post not found");
    });
    test("Create comment fails with server error", async () => {
        jest.spyOn(CommentModel_1.default.prototype, "save").mockImplementationOnce(() => {
            throw new Error("Mocked save error");
        });
        const response = await (0, supertest_1.default)(app).post("/comment").send(Object.assign(Object.assign({}, testComment), { postId }));
        expect(response.statusCode).toBe(500);
        expect(response.body.message).toBe("Error creating comment");
    });
    test("Fetch all comments fails with server error", async () => {
        jest.spyOn(CommentModel_1.default, "find").mockRejectedValueOnce(new Error("Mocked fetch error"));
        const response = await (0, supertest_1.default)(app).get("/comment/all");
        expect(response.statusCode).toBe(500);
        expect(response.body.message).toBe("Error fetching comments");
    });
    test("Fetch all comments after creation", async () => {
        const response = await (0, supertest_1.default)(app).get("/comment/all");
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveLength(1);
    });
    test("Fetch comment by ID", async () => {
        const response = await (0, supertest_1.default)(app).get(`/comment/${commentId}`);
        expect(response.statusCode).toBe(200);
        expect(response.body._id).toBe(commentId);
        expect(response.body.content).toBe(testComment.content);
    });
    test("Fetch comment by ID fails with non-existent ID", async () => {
        const fakeCommentId = new mongoose_1.default.Types.ObjectId().toString();
        const response = await (0, supertest_1.default)(app).get(`/comment/${fakeCommentId}`);
        expect(response.statusCode).toBe(404);
        expect(response.body.message).toBe("Comment not found");
    });
    test("Fetch comment by ID fails with server error", async () => {
        jest.spyOn(CommentModel_1.default, "findById").mockRejectedValueOnce(new Error("Mocked fetch error"));
        const response = await (0, supertest_1.default)(app).get(`/comment/${commentId}`);
        expect(response.statusCode).toBe(500);
        expect(response.body.message).toBe("Error fetching comment");
    });
    test("Fetch comments by post ID", async () => {
        const response = await (0, supertest_1.default)(app).get(`/comment/post/${postId}`);
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveLength(1);
        expect(response.body[0].postId).toBe(postId);
    });
    test("Fetch comments by post fails with server error", async () => {
        jest.spyOn(CommentModel_1.default, "find").mockRejectedValueOnce(new Error("Mocked fetch error"));
        const response = await (0, supertest_1.default)(app).get(`/comment/post/${postId}`);
        expect(response.statusCode).toBe(500);
        expect(response.body.message).toBe("Error fetching comments for post");
    });
    test("Update comment content", async () => {
        const updatedContent = "Updated content";
        const response = await (0, supertest_1.default)(app).put(`/comment/update/${commentId}`).send({ content: updatedContent, owner: testComment.owner });
        expect(response.statusCode).toBe(200);
        expect(response.body.content).toBe(updatedContent);
    });
    test("Attempt to update a non-existing comment", async () => {
        const fakeId = new mongoose_1.default.Types.ObjectId().toString();
        const response = await (0, supertest_1.default)(app).put(`/comment/update/${fakeId}`).send({ content: "Updated content", owner: "Fake owner" });
        expect(response.statusCode).toBe(404);
        expect(response.body.message).toBe("Comment not found");
    });
    test("Update comment fails with server error", async () => {
        jest.spyOn(CommentModel_1.default, "findByIdAndUpdate").mockRejectedValueOnce(new Error("Mocked update error"));
        const response = await (0, supertest_1.default)(app).put(`/comment/update/${commentId}`).send({ content: "New content", owner: testComment.owner });
        expect(response.statusCode).toBe(500);
        expect(response.body.message).toBe("Error updating comment");
    });
    test("Delete a comment by ID", async () => {
        const response = await (0, supertest_1.default)(app).delete(`/comment/delete/${commentId}`);
        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe("Comment deleted successfully");
    });
    test("Attempt to delete a non-existing comment", async () => {
        const fakeId = new mongoose_1.default.Types.ObjectId().toString();
        const response = await (0, supertest_1.default)(app).delete(`/comment/delete/${fakeId}`);
        expect(response.statusCode).toBe(404);
        expect(response.body.message).toBe("Comment not found");
    });
    test("Delete comment fails with server error", async () => {
        jest.spyOn(CommentModel_1.default, "findByIdAndDelete").mockImplementationOnce(() => {
            throw new Error("Mocked delete error");
        });
        const response = await (0, supertest_1.default)(app).delete(`/comment/delete/${commentId}`);
        expect(response.statusCode).toBe(500);
        expect(response.body.message).toBe("Failed to delete comment");
    });
    test("Fetch all comments after deletion", async () => {
        await (0, supertest_1.default)(app).delete("/comment/delete/all");
        const response = await (0, supertest_1.default)(app).get("/comment/all");
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveLength(0);
    });
});
