import request from "supertest";
import initApp from "../server";
import mongoose from "mongoose";
import postModel from "../models/PostModel";
import { Express } from "express";

let app :Express;
const testPost = {
    title: "Test title",
    content: "Test content",
    owner: "Test owner",
  };
  const invalidPost = {
    title: "Test title",
    content: "Test content",
  };


beforeAll(async () => {
    console.log('beforeAll');
    app = await initApp();
    await postModel.deleteMany();
});

afterAll(async () => {
    console.log('afterAll');
    await mongoose.connection.close();
  });

  var postId="";

  describe("Posts test suite", () => {
    test("Post test get all posts", async () => {
      const response = await request(app).get("/post");
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveLength(0);
    });
});

test("Test adding new post", async () => {
    const response = await request(app).post("/post").send({testPost});
    expect(response.statusCode).toBe(201);
    expect(response.body.title).toBe("testPost.title");
    expect(response.body.content).toBe("testPost.content");
    expect(response.body.owner).toBe("testPost.owner");
    postId = response.body._id;
  });

  test("Test Addding invalid post", async () => {
    const response = await request(app).post("/posts").send(invalidPost);
    expect(response.statusCode).not.toBe(201);
  });

  test("Test getting all posts", async () => {
    const response = await request(app).get("/post");
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveLength(1);
  });

  test("Test get post by owner", async () => {
    const response = await request(app).get("/posts?owner=" + testPost.owner);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].owner).toBe(testPost.owner);
  });

  test("Test get post by id", async () => {
    const response = await request(app).get("/posts/" + postId);
    expect(response.statusCode).toBe(200);
    expect(response.body._id).toBe(postId);
  });

  test("Test get post by id fail", async () => {
    const response = await request(app).get("/posts/67447b032ce3164be7c4412d");
    expect(response.statusCode).toBe(400);
  });