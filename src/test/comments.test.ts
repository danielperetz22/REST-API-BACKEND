import request from "supertest";
import initApp from "../server";
import mongoose from "mongoose";
import { Express } from "express";
import CommentModel from "../models/CommentModel";
import PostModel from "../models/PostModel";
import AuthModel from "../models/AuthModel";

let app: Express;
let commentId = "";
let postId = "";

const testComment = {
  content: "This is a test comment",
  postId: "",
};

type UserInfo = {
  email: string;
  username: string;
  password: string;
  _id?: string;
  accessToken?: string;
  refreshToken?: string;
};

const userInfo: UserInfo = {
  email: "testuser@gmail.com",
  username: "testuser",
  password: "testpassword",
};

beforeAll(async () => {
  app = await initApp();
  // Clean DB
  await PostModel.deleteMany();
  await CommentModel.deleteMany();
  await AuthModel.deleteMany();

  // 1) Register & Login user
  await request(app).post("/auth/register").send(userInfo);
  const response = await request(app).post("/auth/login").send(userInfo);
  userInfo._id = response.body._id;
  userInfo.accessToken = response.body.accessToken;
  userInfo.refreshToken = response.body.refreshToken;

  // 2) Create a test post
  const postResponse = await request(app)
    .post("/post")
    .set("Authorization", "Bearer " + userInfo.accessToken)
    .send({ title: "Test Post", content: "Test Post Content" });
  
  postId = postResponse.body._id;
  testComment.postId = postId;
  console.log("Created Post ID:", postId); 
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("🚀 Comments API Tests", () => {
  test("GET /comment - returns an empty list initially", async () => {
    const response = await request(app).get("/comment");
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual([]);
  });

  test("POST /comment - creates a new comment", async () => {
    const response = await request(app)
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
    const response = await request(app)
      .post("/comment")
      .set("Authorization", "Bearer " + userInfo.accessToken)
      .send({ content: "" });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("Content and postId are required");
  });

  test("GET /comment - returns all comments after creation", async () => {
    const response = await request(app).get("/comment");
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBeGreaterThan(0);
  });

  test("GET /comment/:id - retrieves a comment by ID", async () => {
    const response = await request(app).get(`/comment/${commentId}`);
    expect(response.statusCode).toBe(200);
    expect(response.body._id).toBe(commentId);
  });

  test("GET /comment?postId=:postId - retrieves comments by post ID", async () => {
    const response = await request(app).get(`/comment?postId=${postId}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBeGreaterThan(0);
  });
  test("PUT /comment/:id - fails with invalid token", async () => {
    const response = await request(app)
      .put(`/comment/${commentId}`)
      .set("Authorization", "Bearer invalidToken")
      .send({ comment: "Should not update" });



    expect([400, 401]).toContain(response.statusCode);
  });

  test("PUT /comment/:id - returns 404 when updating non-existing comment", async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const response = await request(app)
      .put(`/comment/${fakeId}`)
      .set("Authorization", "Bearer " + userInfo.accessToken)
      .send({ comment: "Should not work" });

    expect(response.statusCode).toBe(404);
    expect(response.body.message).toBe("Comment not found");
  });

  test("DELETE /comment/:id - returns 404 when deleting non-existing comment", async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const response = await request(app)
      .delete(`/comment/${fakeId}`)
      .set("Authorization", "Bearer " + userInfo.accessToken);

    expect(response.statusCode).toBe(404);
    expect(response.body.message).toBe("Comment not found");
  });
});
