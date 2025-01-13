import request from "supertest";
import initApp from "../server";
import mongoose from "mongoose";
import CommentModel from "../models/CommentModel";
import AuthModel from "../models/AuthModel";
import { Express} from "express";
import PostModel from "../models/PostModel";

  let app :Express;
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
      app = await initApp();
      await PostModel.deleteMany();

      const post = new PostModel(testPost);
      const savedPost = await post.save() as { _id: mongoose.Types.ObjectId };
      postId = savedPost._id.toString();
  });


  afterAll(async () => {
      await mongoose.connection.close();
    });

    


  describe("Posts test suite", () => {

    test("Fetch all comments - initially empty", async () => {
        const response = await request(app).get("/comment/all");
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveLength(0);
      });
    
      test("Create a new comment", async () => {
        const response = await request(app).post("/comment").send({ ...testComment, postId });
        expect(response.statusCode).toBe(201);
        expect(response.body.content).toBe(testComment.content);
        expect(response.body.postId).toBe(postId);
        expect(response.body.owner).toBe(testComment.owner);
        commentId = response.body._id;
      });
    
      test("Attempt to create an invalid comment", async () => {
        const response = await request(app).post("/comment").send(invalidComment);
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe("Content, postId, and owner are required");
      });

      test("Create comment fails with missing content", async () => {
        const response = await request(app).post("/comment").send({ postId, owner: testComment.owner });
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe("Content, postId, and owner are required");
      });

      test("Create comment fails with missing postId", async () => {
        const response = await request(app).post("/comment").send({ content: testComment.content, owner: testComment.owner });
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe("Content, postId, and owner are required");
      });
      
      test("Create comment fails with missing owner", async () => {
        const response = await request(app).post("/comment").send({ content: testComment.content, postId });
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe("Content, postId, and owner are required");
      });

      test("Create comment fails with non-existent postId", async () => {
        const fakePostId = new mongoose.Types.ObjectId().toString();
        const response = await request(app).post("/comment").send({ content: testComment.content, postId: fakePostId, owner: testComment.owner });
        expect(response.statusCode).toBe(404);
        expect(response.body.message).toBe("Post not found");
      });

      test("Create comment fails with server error", async () => {
        jest.spyOn(CommentModel.prototype, "save").mockImplementationOnce(() => {
          throw new Error("Mocked save error");
        });
        const response = await request(app).post("/comment").send({ ...testComment, postId });
        expect(response.statusCode).toBe(500);
        expect(response.body.message).toBe("Error creating comment");
      });
      
      test("Fetch all comments fails with server error", async () => {
        jest.spyOn(CommentModel, "find").mockRejectedValueOnce(new Error("Mocked fetch error"));
        
        const response = await request(app).get("/comment/all");
        expect(response.statusCode).toBe(500);
        expect(response.body.message).toBe("Error fetching comments");
      });
    
      test("Fetch all comments after creation", async () => {
        const response = await request(app).get("/comment/all");
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveLength(1);
      });
    
      test("Fetch comment by ID", async () => {
        const response = await request(app).get(`/comment/${commentId}`);
        expect(response.statusCode).toBe(200);
        expect(response.body._id).toBe(commentId);
        expect(response.body.content).toBe(testComment.content);
      });

      test("Fetch comment by ID fails with non-existent ID", async () => {
        const fakeCommentId = new mongoose.Types.ObjectId().toString();
        const response = await request(app).get(`/comment/${fakeCommentId}`);
        expect(response.statusCode).toBe(404);
        expect(response.body.message).toBe("Comment not found");
      });
      
      test("Fetch comment by ID fails with server error", async () => {
        jest.spyOn(CommentModel, "findById").mockRejectedValueOnce(new Error("Mocked fetch error"));
        const response = await request(app).get(`/comment/${commentId}`);
        expect(response.statusCode).toBe(500);
        expect(response.body.message).toBe("Error fetching comment");
      });
    
      test("Fetch comments by post ID", async () => {
        const response = await request(app).get(`/comment/post/${postId}`);
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveLength(1);
        expect(response.body[0].postId).toBe(postId);
      });

      test("Fetch comments by post fails with server error", async () => {
        jest.spyOn(CommentModel, "find").mockRejectedValueOnce(new Error("Mocked fetch error"));
        const response = await request(app).get(`/comment/post/${postId}`);
        expect(response.statusCode).toBe(500);
        expect(response.body.message).toBe("Error fetching comments for post");
      });
    
      test("Update comment content", async () => {
        const updatedContent = "Updated content";
        const response = await request(app).put(`/comment/update/${commentId}`).send({ content: updatedContent, owner: testComment.owner });
        expect(response.statusCode).toBe(200);
        expect(response.body.content).toBe(updatedContent);
      });
    
      test("Attempt to update a non-existing comment", async () => {
        const fakeId = new mongoose.Types.ObjectId().toString();
        const response = await request(app).put(`/comment/update/${fakeId}`).send({ content: "Updated content", owner: "Fake owner" });
        expect(response.statusCode).toBe(404);
        expect(response.body.message).toBe("Comment not found");
      });

      test("Update comment fails with server error", async () => {
        jest.spyOn(CommentModel, "findByIdAndUpdate").mockRejectedValueOnce(new Error("Mocked update error"));
        const response = await request(app).put(`/comment/update/${commentId}`).send({ content: "New content", owner: testComment.owner });
        expect(response.statusCode).toBe(500);
        expect(response.body.message).toBe("Error updating comment");
      });
    
      test("Delete a comment by ID", async () => {
        const response = await request(app).delete(`/comment/delete/${commentId}`);
        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe("Comment deleted successfully");
      });
    
      test("Attempt to delete a non-existing comment", async () => {
        const fakeId = new mongoose.Types.ObjectId().toString();
        const response = await request(app).delete(`/comment/delete/${fakeId}`);
        expect(response.statusCode).toBe(404);
        expect(response.body.message).toBe("Comment not found");
      });

      test("Delete comment fails with server error", async () => {
        jest.spyOn(CommentModel, "findByIdAndDelete").mockImplementationOnce(() => {
          throw new Error("Mocked delete error");
        });
        const response = await request(app).delete(`/comment/delete/${commentId}`);
        expect(response.statusCode).toBe(500);
        expect(response.body.message).toBe("Failed to delete comment");
      });
    
      test("Fetch all comments after deletion", async () => {
        await request(app).delete("/comment/delete/all");
        const response = await request(app).get("/comment/all");
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveLength(0);
      });
  });