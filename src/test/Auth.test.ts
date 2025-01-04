import request  from "supertest";
import initApp from '../server';
import mongoose from 'mongoose';
import User from '../models/AuthModel';
import e, { Express } from 'express';

let app: Express;

beforeAll(async () => {
    app = await initApp();
  //await User.deleteMany({});
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
        expect(response.status).toBe(200);
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

    test('Get prodeuct API', async () => {
        const response = await request(app).post("/posts").send({
            title: "My first post",
          content: "this is my first post",
          owner : userInfo._id,
        });
        expect(response.status).not.toBe(201);
    });
    test('Get prodeuct API', async () => {
        const response2 = await request(app).post("/posts").set({
            authorization: 'jwt ' + userInfo.token,
        }).send({
            title: "My first post",
          content: "this is my first post",
          owner : userInfo._id,
        });
        expect(response2.status).toBe(201);
    });

}); 


