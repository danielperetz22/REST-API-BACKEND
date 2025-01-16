import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import userModel, { IUser } from "../models/AuthModel";
import { Document } from "mongoose";

declare global {
  namespace Express {
    interface Request { 
      user?: any;
    }
  }
}

const generateTokens = (_id : string): { refreshToken: string; accessToken: string } | null => {
  if (process.env.ACCESS_TOKEN_SECRET===undefined) {
    return null;
  }
  const rand = Math.random();
  const accessToken = jwt.sign(
    { _id: _id, rand: rand },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.TOKEN_EXPIRATION }
  );

  const refreshToken = jwt.sign(
    { _id: _id, rand:rand },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRATION }
  );

  return { refreshToken:refreshToken, accessToken:accessToken };
};

const register = async (req: Request, res: Response) => {
  const { username, email, password } = req.body;

  if (!username || typeof username !== 'string') {
    res.status(400).json({ message: "Username is required and must be a string" });
    return;
  }
  if (!email || typeof email !== 'string') {
    res.status(400).json({ message: "Email is required and must be a string" });
    return;
  }
  if (!password || typeof password !== 'string') {
    res.status(400).json({ message: "Password is required and must be a string" });
    return;
  }

  try {
    const existingUser = await userModel.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      const errorMessage =
        existingUser.email === email
          ? "Email already in use"
          : "Username already in use";
      res.status(400).json({ error: errorMessage });
      return;
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user: IUser = await userModel.create({
      username,
      email,
      password: hashedPassword,
    });
    res.status(201).json({
      message: "User registered successfully",
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
      },
    });
    return;
  } catch (err) {
    console.error("Error in register:", err);
    res.status(500).json({ message: "Internal server error", error: err });
  }
};

const login = async (req: Request, res: Response) => {
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;
  try {
    if ((!username && !email) || !password) {
      res.status(400).json({ message: "Username or email and password are required" });
      return;
    }

    const user = await userModel.findOne({ $or: [{ username }, { email }] });
    if (!user) {
      res.status(400).json({ message: "Invalid username, email, or password" });
      return;
    }
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      res.status(400).json({ message: "Invalid username, email, or password" });
      return;
    }

    const tokens = generateTokens(user._id as string);
    if (!tokens) {
      res.status(500).json({ message: "Failed to generate tokens" });
      return;
    }
    //console.log("Generated Access Token:", tokens.accessToken);
    if (user.refeshtokens == undefined) {
      user.refeshtokens = [];
    }
    user.refeshtokens.push(tokens.refreshToken);
    user.save();
    res.status(200).json({ ...tokens, _Id: user._id });
  } catch (err) {
    res.status(400).json({ message: "Error during login", error: err });
  }

};


const validateRefreshToken = (refreshToken: string | undefined) => {
  return new Promise<Document<unknown, {}, IUser> & IUser>((resolve, reject) => {
    if (refreshToken == null) {
      reject("error");
      return;
    }
  if (!process.env.ACCESS_TOKEN_SECRET) {
    reject("error");
      return;
  }

  jwt.verify(refreshToken, process.env.ACCESS_TOKEN_SECRET, async (err: any, payload: any) => {
    if (err) {
      reject(err);
      return;
    }
    const userId = (payload as Payload)._id;
    try {
      const user = await userModel.findById(userId);
      if (!user) {
        reject("error");
        return;
      }
      //check if token exists
      if (!user.refeshtokens || !user.refeshtokens.includes(refreshToken)) {
        user.refeshtokens = [];
        await user.save();
        reject(err);
        return;
      }
      resolve(user);
    } catch (err) {
      reject(err);
    }
  });
});
}
type Payload = {
  _id: string;
}

const refresh = async (req: Request, res: Response) => {
  try {
    const user = await validateRefreshToken(req.body.refreshToken);

    const tokens = generateTokens(user._id as string);
    if (!tokens) {
      res.status(400).send("error");
      return;
    }
    user.refeshtokens = user.refeshtokens!.filter((token) => token !== req.body.refreshToken);
    user.refeshtokens.push(tokens.refreshToken);
    await user.save();
    res.status(200).send({
      ...tokens,
      _id: user._id
    });
  } catch (err) {
    res.status(400).send("error");
  }
};

const logout = async (req: Request, res: Response) => {
  try {
    const user = await validateRefreshToken(req.body.refreshToken);
    if (!user) {
      res.status(400).send("error");
      return;
    }
    //remove the token from the user
    user.refeshtokens = user.refeshtokens!.filter((token) => token !== req.body.refreshToken);
    await user.save();
    res.status(200).send("logged out");
  } catch (err) {
    res.status(400).send("error");
    return;
  }
};
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const tokenHeader = req.headers["authorization"];
  const token = tokenHeader && tokenHeader.split(" ")[1];
  if (!token) {
    res.status(400).send("Access denied: Missing token");
    return;
  }
  if (process.env.ACCESS_TOKEN_SECRET === undefined) {
    res.status(500).send("Server error: Missing token secret");
    return;
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
    if (err) {
      res.status(400).send("Access denied: Invalid token");
    } else {
      req.user = { _id: (payload as Payload)._id }; 
      next();
    }
  });
};


export default {register,login,refresh,logout,};