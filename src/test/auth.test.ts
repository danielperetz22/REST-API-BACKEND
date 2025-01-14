import request  from "supertest";
import initApp from '../server';
import mongoose from 'mongoose';
import User from '../models/AuthModel';
import e, { Express, response } from 'express';

let app: Express;

beforeAll(async () => {
    process.env.JWT_SECRET = 'your_secret_key';
    app = await initApp();
  await User.deleteMany({}); 
});

afterAll(async () => {  
    await mongoose.connection.close();
});

type UserInfo = {
    username: string;
    email: string;
    password: string;
    token?: string;
    _id?: string;
};
const userInfo:UserInfo = {  
    username: "daniel",
    email: "daniel@gmail.com",
    password: "123456"
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

describe('Auth Tests', () => {
  
  let accessToken: string;
  let refreshToken: string;

  beforeEach(async () => {
    await request(app).post("/auth/register").send(userInfo);
    const loginResponse = await request(app).post("/auth/login").send(userInfo);
    accessToken = loginResponse.body.accessToken;
    refreshToken = loginResponse.body.refreshToken;
  });

  test('Auth Register', async () => {
    const response = await request(app).post('/auth/register').send({
      username: 'yohai',
      email: 'yohai@gmail.com',
      password: 'yohai123',
    });
    expect(response.status).toBe(201);
    const user = await User.findOne({ email: userInfo.email });
    expect(user).not.toBeNull();
  });
  
    
    test("Auth Register with existing email", async () => {
      const response = await request(app).post("/auth/register").send({
        username: "newuser",
        email: userInfo.email, 
        password: "password123",
      });
      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Email is already in use");
    });
    


    test('Auth Register with existing username', async () => {
      const response = await request(app).post("/auth/register").send({
        username: userInfo.username, 
        email: "newemail@example.com", 
        password: "password123",
      });
      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Username already in use");
    });

      test('Auth Register without username', async () => {
        const response = await request(app).post('/auth/register').send({
          username: '',
          email: 'newemail@gmail.com',
          password: '123456',
        });
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('All fields (username, email, and password) are required');
      });

      test('Auth Register without password', async () => {
        const response = await request(app).post('/auth/register').send({
          username: 'dadas',
          email: 'newemail',
          password: '',
        });
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('All fields (username, email, and password) are required');
      });

      test('Auth Register without email', async () => {
        const response = await request(app).post('/auth/register').send({
          username: 'dadas',
          email: '',
          password: '123456',
        });
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('All fields (username, email, and password) are required');
      });
      test('Registration fails when required fields are missing', async () => {
        const response = await request(app).post('/auth/register').send({
            username: 'testuser',
        });
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('All fields (username, email, and password) are required');
    });
      test('Auth Login with valid username and password', async () => {
        await request(app).post('/auth/register').send(userInfo);
        const response = await request(app).post('/auth/login').send({
            username: userInfo.username,
            password: userInfo.password,
        });
        expect(response.status).toBe(200);
        expect(response.body.accessToken).not.toBeNull();
    });
    test('Auth Login with valid email and password', async () => {
        await request(app).post('/auth/register').send(userInfo);
        const response = await request(app).post('/auth/login').send({
            email: userInfo.email,
            password: userInfo.password,
        });
        expect(response.status).toBe(200);
        expect(response.body.accessToken).not.toBeNull();
    });  
    test('Auth Login with non-existing email', async () => {
        await request(app).post('/auth/register').send(userInfo);
        const response = await request(app).post('/auth/login').send({
            email: "don@gmail.com",
            password: userInfo.password,
        }); 
        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Invalid username, email, or password");
    });
    test('Auth Login with non-existing username', async () => {
      const response = await request(app).post('/auth/login').send({
        username: 'nonexistent',
        password: userInfo.password
      });
      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid username, email, or password');
    });
    test('Auth Login with invalid password', async () => {
        await request(app).post('/auth/register').send(userInfo);
        const response = await request(app).post('/auth/login').send({
          email: userInfo.email,
          password: 'wrongpassword'
        });
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Invalid username, email, or password');
      });
    
    
    test('Login fails when username or email and password are missing', async () => {
        const response = await request(app).post('/auth/login').send({
            username: 'testuser',
        });
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Username or email and password are required');
    });
    test('Login fails with invalid username or email', async () => {
        const response = await request(app).post('/auth/login').send({
            username: 'nonexistentuser',
            email: 'nonexistent@example.com',
            password: '123456',
        });
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Invalid username, email, or password');
    });

    test('Login fails with invalid password', async () => {
        await User.deleteMany({});
        await request(app).post('/auth/register').send({
            username: 'testuser',
            email: 'test@example.com',
            password: 'correctpassword',
        });
    
        const response = await request(app).post('/auth/login').send({
            username: 'testuser',
            password: 'wrongpassword',
        });
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Invalid username, email, or password');
    });
    test("Login fails to generate tokens because SECRET is missing", async () => {
      const originalSecret = process.env.ACCESS_TOKEN_SECRET;
      delete process.env.ACCESS_TOKEN_SECRET;  
    
      const response = await request(app)
        .post("/auth/login")
        .send({
          email: userInfo.email,
          password: userInfo.password
        });
    
      expect(response.status).toBe(500);
      expect(response.body.message).toBe("Failed to generate tokens");
    
      
      process.env.ACCESS_TOKEN_SECRET = originalSecret;
    });

    test("Refresh tokens - valid refresh token", async () => {
      const response = await request(app)
        .post("/auth/refresh")
        .send({ refreshToken });
  
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("accessToken");
      expect(response.body).toHaveProperty("refreshToken");
      expect(response.body.refreshToken).not.toBe(refreshToken); 
    });
  
    test("Refresh tokens - invalid refresh token", async () => {
      const invalidToken = "invalidToken123";
      const response = await request(app)
        .post("/auth/refresh")
        .send({ refreshToken: invalidToken });
  
      expect(response.status).toBe(400);
      expect(response.text).toBe("error");
    });
  
    test("Logout - valid refresh token", async () => {
      const response = await request(app)
        .post("/auth/logout")
        .send({ refreshToken });
  
      expect(response.status).toBe(200);
      expect(response.text).toBe("logged out");
  
      
      const refreshResponse = await request(app)
        .post("/auth/refresh")
        .send({ refreshToken });
  
      expect(refreshResponse.status).toBe(400);
      expect(refreshResponse.text).toBe("error");
    });
  
    test("Logout - invalid refresh token", async () => {
      const invalidToken = "invalidToken123";
      const response = await request(app)
        .post("/auth/logout")
        .send({ refreshToken: invalidToken });
  
      expect(response.status).toBe(400);
      expect(response.text).toBe("error");
    });

    test("Missing token => 400 'Access denied: Missing token'", async () => {
      const response = await request(app).get("/auth/testAuth");
      expect(response.status).toBe(400);
      expect(response.text).toBe("Access denied: Missing token");
    });

    test("Missing ACCESS_TOKEN_SECRET ", async () => {
      const originalSecret = process.env.ACCESS_TOKEN_SECRET;
      delete process.env.ACCESS_TOKEN_SECRET;
      const response = await request(app)
        .get("/auth/testAuth")
        .set("Authorization", "Bearer someFakeToken");
      expect(response.status).toBe(500);
      expect(response.text).toBe("Server error: Missing token secret");
      process.env.ACCESS_TOKEN_SECRET = originalSecret;
    });
    test("Invalid token 'Access denied'", async () => {
      
      const response = await request(app)
        .get("/auth/testAuth")
        .set("Authorization", "Bearer invalidToken123");
      expect(response.status).toBe(400);
      expect(response.text).toBe("Access denied: Invalid token");
    });
  
    test("Valid token pass middleware", async () => {
     
      const loginResponse = await request(app)
        .post("/auth/login")
        .send({ username: userInfo.username, password: userInfo.password });
      const validToken = loginResponse.body.accessToken;
  
      const response = await request(app)
        .get("/auth/testAuth")
        .set("Authorization", "Bearer " + validToken);
      expect(response.status).toBe(200);
      expect(response.body.message).toBe("You are authenticated");
    });
});
