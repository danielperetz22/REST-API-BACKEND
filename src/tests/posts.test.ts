import request from "supertest";
import initApp from "../server";
import mongoose from "mongoose";
import postModel from "../models/PostModel";
import { Express } from "express";

let app :Express;
type TestPost = {
  title: string;
  content: string;
  owner?: string; 
  senderId: string;
  createdAt?: Date; 
  updatedAt?: Date; 
}

const testPost : TestPost  = {
    title: "Test title 2",
    content: "Test content",
    senderId: "Test owner",
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
      const response = await request(app).get("/posts/all");
      expect(response.statusCode).toBe(200);
      expect(response.body.posts).toHaveLength(0);
    });
test("Test adding new post", async () => {
    const response = await request(app).post("/posts").send({
      title: testPost.title,
      content: testPost.content,
      senderId: testPost.senderId,
    });
    console.log("************************** add post response **************************");
    console.log(response.body.post);
    expect(response.statusCode).toBe(201);
    expect(response.body.post.title).toBe(testPost.title);
    expect(response.body.post.content).toBe(testPost.content);
    expect(response.body.post.owner).toBe(testPost.owner);
    postId = response.body.post._id;
  });

  test("Test Addding invalid post", async () => {
    const response = await request(app).post("/posts").send(invalidPost);
    expect(response.statusCode).not.toBe(201);
  });

  test("Test getting all posts", async () => {
    const response = await request(app).get("/posts/all");
    expect(response.statusCode).toBe(200);
    expect(response.body.posts).toHaveLength(1);
  });

  test("Test get post by owner", async () => {
    const response = await request(app).get("/posts/bySender?owner=" + testPost.owner);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].owner).toBe(testPost.owner);
  });

  test("Test get post by id", async () => {
    const response = await request(app).get("/posts/:id" + postId);
    expect(response.statusCode).toBe(200);
    expect(response.body.post._id).toBe(postId);
  });

  test("Test get post by id fail", async () => {
    const response = await request(app).get("/posts/67447b032ce3164be7c4412d");
    expect(response.statusCode).toBe(400);
  });

});