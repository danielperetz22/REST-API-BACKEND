import request  from "supertest";
import initApp from '../server';
import mongoose from 'mongoose';
import User from '../models/AuthModel';
import e, { Express } from 'express';

let app: Express;

beforeAll(async () => {
    process.env.JWT_SECRET = 'your_secret_key';
    app = await initApp();
  await User.deleteMany({});


  afterAll(async () => {
    await mongoose.disconnect();
  });

  
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
describe('Auth Tests', () => {
    test('Auth Register', async () => {
        const response = await request(app).post('/auth/register').send(userInfo);
        console.log(response.body);
        expect(response.status).toBe(201);
    });

    test('Auth Login Tests', async () => {
        const response = await request(app).post('/auth/login').send(userInfo);
        console.log(response.body);
        expect(response.status).toBe(200);
        const token = response.body.token;
        expect(token).not.toBeNull();
        const userId =  response.body._id;
        expect(userId).not.toBeNull();
        userInfo.token = token;
        userInfo._id = userId;
    }); 

    test('Create post without auth', async () => {
        const response = await request(app).post("/post").send({
            title: "My first post",
            content: "this is my first post",
            owner: userInfo._id,
        });
        console.log(response.body);
        expect(response.status).toBe(401);
    });
    test('Create post with auth', async () => {
        const response2 = await request(app).post("/post").set({
            authorization: 'Bearer ' + userInfo.token,
        }).send({
            title: "My first post",
            content: "this is my first post",
            owner: userInfo._id,
        });
        expect(response2.status).toBe(201);
    });

});