import request from "supertest";
import initApp from "../server";
import mongoose from "mongoose";
import PostModel from "../models/PostModel";
import AuthModel from "../models/AuthModel";
import { Express } from "express";

let app: Express;
let postId = "";

type UserInfo = {
  email: string;
  username: string;
  password: string;
  _id?: string;
  accessToken?: string;
  refreshToken?: string;
};

const userInfo: UserInfo = {
  email: "hila@gmail.com",
  username: "hila",
  password: "123456",
};

beforeAll(async () => {
  app = await initApp();
  await PostModel.deleteMany();
  await AuthModel.deleteMany();
  await request(app).post("/auth/register").send(userInfo);
  const response = await request(app).post("/auth/login").send(userInfo);
  userInfo._id = response.body._id || response.body._Id;
  userInfo.accessToken = response.body.accessToken;
  userInfo.refreshToken = response.body.refreshToken;
});

afterAll(async () => {
  if (postId) {
  await PostModel.findByIdAndDelete(postId);
  }
  await mongoose.connection.close();
});

describe("🚀 Posts API Test Suite", () => {
  test("GET /post/all - should be empty at start", async () => {
    const response = await request(app).get("/post/all");
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(0);
  });

  test("POST /post - creates a new post", async () => {
    const response = await request(app)
      .post("/post")
      .set("Authorization", "Bearer " + userInfo.accessToken)
      .send({
        title: "Test Post",
        content: "This is a test post content",
      });

    console.log("✅ Created Post Response:", response.body);

    postId = response.body._id;
    expect(response.status).toBe(201);
    expect(postId).toBeDefined();
    expect(response.body.owner).toBe(userInfo._id);
  });

  test("POST /post - fails to create a post (missing content)", async () => {
    const response = await request(app)
      .post("/post")
      .set("Authorization", "Bearer " + userInfo.accessToken)
      .send({
        title: "Missing Content",
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Missing required fields: title and content");
  });

  test("GET /post/all - returns 1 post after creation", async () => {
    const response = await request(app).get("/post/all");
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
  });

  test("GET /post/:id - retrieves a post by ID", async () => {
    const response = await request(app).get(`/post/${postId}`);
    expect(response.status).toBe(200);
    expect(response.body._id).toBe(postId);
    expect(response.body.title).toBe("Test Post");
    expect(response.body.owner).toBe(userInfo._id);
  });

  test("GET /post/:id - fails on invalid ID", async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const response = await request(app).get(`/post/${fakeId}`);
    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Post not found");
  });

  test("GET /post/all?owner=:owner - retrieves posts by owner ID", async () => {
    const response = await request(app).get(`/post/all?owner=${userInfo._id}`);
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
  });

  test("PUT /post/:id - fails when post does not exist", async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const response = await request(app)
      .put(`/post/${fakeId}`)
      .set("Authorization", "Bearer " + userInfo.accessToken)
      .send({
        title: "Should Not Work",
        content: "No post found",
      });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Post not found");
  });

  test("PUT /post/:id - fails with missing fields", async () => {
    const response = await request(app)
      .put(`/post/${postId}`)
      .set("Authorization", "Bearer " + userInfo.accessToken)
      .send({
        title: "Only title updated",
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Missing data");
  });

  test("DELETE /post/:id - deletes a post", async () => {
    const response = await request(app)
      .delete(`/post/${postId}`)
      .set("Authorization", "Bearer " + userInfo.accessToken);

    console.log("✅ Delete Post Response:", response.body);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Post deleted successfully");
  });

  test("DELETE /post/:id - fails on non-existing post", async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const response = await request(app)
      .delete(`/post/${fakeId}`)
      .set("Authorization", "Bearer " + userInfo.accessToken);

    expect(response.status).toBe(404);
  });
});
