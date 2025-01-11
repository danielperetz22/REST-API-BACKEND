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
const mongoose_1 = __importDefault(require("mongoose"));
const PostModel_1 = __importDefault(require("../models/PostModel"));
let app;
let postId = '';
const testPost = {
    title: 'Test title',
    content: 'Test content',
    senderId: 'Test senderId',
};
const invalidPost = {
    title: "Test title",
    content: "Test content",
};
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    app = yield (0, server_1.default)();
    yield PostModel_1.default.deleteMany();
}));
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield mongoose_1.default.connection.close();
}));
describe("Posts test suite", () => {
    // Section 1: Add Post Tests
    test("Test adding a new post successfully", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).post("/post").send({
            title: testPost.title,
            content: testPost.content,
            senderId: testPost.senderId,
        });
        expect(response.statusCode).toBe(201);
        expect(response.body.post.title).toBe(testPost.title);
        expect(response.body.post.content).toBe(testPost.content);
        expect(response.body.post.senderId).toBe(testPost.senderId);
        postId = response.body.post._id;
    }));
    test("Test - should fail to add an invalid post", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).post("/post").send(invalidPost);
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toContain("Missing required fields");
    }));
    test("Test adding post with database error", () => __awaiter(void 0, void 0, void 0, function* () {
        jest.spyOn(PostModel_1.default.prototype, 'save').mockRejectedValueOnce(new Error('Database error'));
        const response = yield (0, supertest_1.default)(app).post("/post").send(testPost);
        expect(response.statusCode).toBe(500);
        expect(response.body.error).toBe('Error: Database error');
        jest.restoreAllMocks();
    }));
    // Section 2: Get Post Tests
    test("Test getting all posts successfully", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).get("/post/all");
        expect(response.statusCode).toBe(200);
        expect(response.body.posts).toHaveLength(1);
    }));
    test("Test getAllPosts with database error", () => __awaiter(void 0, void 0, void 0, function* () {
        jest.spyOn(PostModel_1.default, 'find').mockRejectedValueOnce(new Error('Database error'));
        const response = yield (0, supertest_1.default)(app).get("/post/all");
        expect(response.statusCode).toBe(500);
        expect(response.body.error).toBe('Error: Database error');
        jest.restoreAllMocks();
    }));
    test("Test get post by post id successfully", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).get("/post/" + postId);
        expect(response.statusCode).toBe(200);
        expect(response.body.post._id).toBe(postId);
    }));
    test("Test get post by invalid id", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).get("/post/" + postId + 5);
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe("Invalid post ID format");
    }));
    test("Test get post by non-existent id", () => __awaiter(void 0, void 0, void 0, function* () {
        const fakeId = new mongoose_1.default.Types.ObjectId();
        const response = yield (0, supertest_1.default)(app).get(`/post/${fakeId}`);
        expect(response.statusCode).toBe(404);
        expect(response.body.message).toContain(`Post with ID ${fakeId} not found`);
    }));
    test("Test get post by senderId", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).get("/post/filter/bySender?senderId=" + testPost.senderId);
        expect(response.statusCode).toBe(200);
        expect(response.body.posts).toHaveLength(1);
        expect(response.body.posts[0].senderId).toBe(testPost.senderId);
    }));
    test("Get posts by senderId with no posts found", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).get("/post/filter/bySender?senderId=nonexistentSender");
        expect(response.statusCode).toBe(404);
        expect(response.body.message).toContain("No posts found for sender ID nonexistentSender");
    }));
    test("Get posts by senderId with missing senderId", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).get("/post/filter/bySender");
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toContain("Sender ID is required");
    }));
    test("Get posts by sender when multiple posts exist", () => __awaiter(void 0, void 0, void 0, function* () {
        const additionalPost = {
            title: "Another title",
            content: "Another post",
            senderId: testPost.senderId,
        };
        yield (0, supertest_1.default)(app).post("/post").send(additionalPost);
        const response = yield (0, supertest_1.default)(app).get("/post/filter/bySender?senderId=" + testPost.senderId);
        expect(response.statusCode).toBe(200);
        expect(response.body.posts).toHaveLength(2);
        expect(response.body.posts[0].senderId).toBe(testPost.senderId);
        expect(response.body.posts[1].senderId).toBe(testPost.senderId);
    }));
    test("Test getPostById with database error", () => __awaiter(void 0, void 0, void 0, function* () {
        const validId = new mongoose_1.default.Types.ObjectId();
        jest.spyOn(PostModel_1.default, 'findById').mockRejectedValueOnce(new Error('Database error'));
        const response = yield (0, supertest_1.default)(app).get(`/post/${validId}`);
        expect(response.statusCode).toBe(500);
        expect(response.body.error).toBe('Error: Database error');
        jest.restoreAllMocks();
    }));
    test("Test getPostsBySender with database error", () => __awaiter(void 0, void 0, void 0, function* () {
        jest.spyOn(PostModel_1.default, 'find').mockRejectedValueOnce(new Error('Database error'));
        const response = yield (0, supertest_1.default)(app).get("/post/filter/bySender?senderId=testSender");
        expect(response.statusCode).toBe(500);
        expect(response.body.error).toBe('Error: Database error');
        jest.restoreAllMocks();
    }));
    // Section 3: Update Post Tests
    test("Test update post with valid data", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).put("/post/" + postId).send({
            title: "Updated title",
            content: "Updated content",
        });
        expect(response.statusCode).toBe(200);
        expect(response.body.post.title).toBe("Updated title");
        expect(response.body.post.content).toBe("Updated content");
    }));
    test("Test update post with empty request body", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).put(`/post/` + postId).send({});
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toContain("Request body cannot be empty");
    }));
    test("Test update non-existent post", () => __awaiter(void 0, void 0, void 0, function* () {
        const fakeId = new mongoose_1.default.Types.ObjectId();
        const response = yield (0, supertest_1.default)(app)
            .put(`/post/${fakeId}`)
            .send({
            title: "Updated title",
            content: "Updated content"
        });
        expect(response.statusCode).toBe(404);
        expect(response.body.message).toBe(`Post with ID ${fakeId} not found`);
    }));
    test("Test update post fail", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).put("/post/67447b032ce3164be7c4412d").send({
            title: "Updated title",
            content: "Updated content",
            senderId: "Updated senderId"
        });
        expect(response.statusCode).not.toBe(201);
    }));
    test("Test updatePost with database error", () => __awaiter(void 0, void 0, void 0, function* () {
        const validId = new mongoose_1.default.Types.ObjectId();
        jest.spyOn(PostModel_1.default, 'findById').mockResolvedValueOnce({ _id: validId });
        jest.spyOn(PostModel_1.default, 'findByIdAndUpdate').mockRejectedValueOnce(new Error('Database error'));
        const response = yield (0, supertest_1.default)(app)
            .put(`/post/${validId}`)
            .send({ title: "Updated title" });
        expect(response.statusCode).toBe(500);
        expect(response.body).toEqual({
            message: 'Error updating posts',
            error: 'Error: Database error'
        });
        jest.restoreAllMocks();
    }));
    test("Test updatePost with validation error", () => __awaiter(void 0, void 0, void 0, function* () {
        const validId = new mongoose_1.default.Types.ObjectId();
        jest.spyOn(PostModel_1.default, 'findById').mockResolvedValueOnce({ _id: validId });
        jest.spyOn(PostModel_1.default, 'findByIdAndUpdate').mockRejectedValueOnce(new Error('Validation error'));
        const response = yield (0, supertest_1.default)(app)
            .put(`/post/${validId}`)
            .send({ title: "" }); // Invalid title
        expect(response.statusCode).toBe(500);
        expect(response.body.error).toBe('Error: Validation error');
        jest.restoreAllMocks();
    }));
    // Section 4: Delete Post Tests
    test("Test delete post", () => __awaiter(void 0, void 0, void 0, function* () {
        const savedPost = yield PostModel_1.default.findById(postId);
        expect(savedPost).not.toBeNull();
        const response = yield (0, supertest_1.default)(app).delete("/post/delete/" + postId);
        expect(response.body.message).toContain("Post deleted successfully");
        expect(response.statusCode).toBe(200);
    }));
    test("Test delete non-existent post", () => __awaiter(void 0, void 0, void 0, function* () {
        const fakeId = new mongoose_1.default.Types.ObjectId();
        const response = yield (0, supertest_1.default)(app)
            .delete(`/post/delete/${fakeId}`);
        expect(response.statusCode).toBe(404);
        expect(response.body.message).toBe(`Post with ID ${fakeId} not found`);
    }));
    test("Test deletePost with database error", () => __awaiter(void 0, void 0, void 0, function* () {
        const validId = new mongoose_1.default.Types.ObjectId();
        jest.spyOn(PostModel_1.default, 'findByIdAndDelete').mockRejectedValueOnce(new Error('Database error'));
        const response = yield (0, supertest_1.default)(app).delete(`/post/delete/${validId}`);
        expect(response.statusCode).toBe(500);
        expect(response.body.error).toBe('Error: Database error');
        jest.restoreAllMocks();
    }));
});
