import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import userModel, { IUser } from "../models/AuthModel";
import { Document } from "mongoose";
import { upload } from "../middlewares/uploadMiddleware";
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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
  const { email, password } = req.body;
  const profileImage = req.file?.path || ""; 

 
  if (!email || typeof email !== "string") {
    res.status(400).json({ message: "Email is required and must be a string" });
    return;
  }
  if (!password || typeof password !== "string") {
    res.status(400).json({ message: "Password is required and must be a string" });
    return;
  }

  try {
    
    const existingUser = await userModel.findOne({ email });

    if (existingUser) {
      res.status(400).json({ error: "Email already in use" });
      return;
    }
    

    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

   
    const user: IUser = await userModel.create({
      email,
      password: hashedPassword,
      profileImage, 
    });

  
    res.status(201).json({
      message: "User registered successfully",
      user: {
        _id: user._id,
        email: user.email,
        profileImage: user.profileImage, 
      },
    });
    return;
  } catch (err) {
    console.error("Error in register:", err);
    res.status(500).json({ message: "Internal server error", error: err });
  }
};


const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    
    if (!email || !password) {
      res.status(400).json({ message: "email and password are required" });
      return;
    }

   
    const user = await userModel.findOne({ email });

    if (!user) {
      res.status(400).json({ message: "Invalid email, or password" });
      return;
    }

    
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      res.status(400).json({ message: "Invalid email, or password" });
      return;
    }

   
    const tokens = generateTokens(user._id as string);
    if (!tokens) {
      res.status(500).json({ message: "Failed to generate tokens" });
      return;
    }

  
    if (!user.refeshtokens) {
      user.refeshtokens = [];
    }
    user.refeshtokens.push(tokens.refreshToken);
    await user.save();

    res.status(200).json({ ...tokens, _id: user._id });
  } catch (err) {
    console.error("Error during login:", err);
    res.status(500).json({ message: "Error during login", error: err });
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



const googleLoginOrRegister = async (req: Request, res: Response) => {
  const { token } = req.body;

  try {
    console.log("Received token:", token);
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      console.log("Invalid Google token");
      res.status(400).json({ message: "Invalid Google token." });
      return;
    }
    console.log("Google payload:", payload);

    const { email, name, picture } = payload;

    if (!email) {
      console.log("Email is missing in Google payload");
      res.status(400).json({ message: "Google account email is required." });
      return;
    }

    let user = await userModel.findOne({ email });

    if (!user) {
      console.log("Creating new user for email:", email);
      user = await userModel.create({
        email,
        password: "",
        profileImage: picture || "",
      });
    }

    const tokens = generateTokens(user._id as string);
    if (!tokens) {
      console.log("Failed to generate tokens");
      res.status(500).json({ message: "Failed to generate tokens." });
      return;
    }

    res.status(200).json({
      ...tokens,
      user: {
        _id: user._id,
        email: user.email,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.error("Error during Google login/register:", error);
    res.status(500).json({ message: "Error logging in/registering with Google.", error });
  }
};

const getUserProfile = async (req: Request, res: Response) => {
  try {
    console.log("req.user:", req.user);

    if (!req.user || !req.user._id) {
       res.status(400).json({ message: "Invalid user ID" });
       return
    }

    const user = await userModel.findById(req.user._id);
    if (!user) {
       res.status(404).json({ message: "User not found" });
       return
    }
    const profileImageUrl = user.profileImage
    ? `http://localhost:3000/${user.profileImage.replace(/\\/g, "/")}` // החלפת `\` ל-`/`
    : "https://example.com/default-avatar.jpg";
    console.log("User profile data:", user);

    res.status(200).json({
      _id: user._id,
      email: user.email,
      profileImage: profileImageUrl,
    });
  } catch (err) {
    console.error("Error getting user profile:", err);
    res.status(500).json({ message: "Internal server error", error: err });
  }
};

const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
       res.status(400).json({ message: "Invalid user ID" });
       return
    }

    const { email, profileImage } = req.body;

    if (email && typeof email !== "string") {
       res.status(400).json({ message: "Invalid email format" });
      return
    }
    if (profileImage && typeof profileImage !== "string") {
       res.status(400).json({ message: "Invalid profileImage format" });
       return
    }

    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      {
        ...(email && { email }), 
        ...(profileImage && { profileImage }),
      },
      { new: true }
    );

    if (!updatedUser) {
       res.status(404).json({ message: "User not found" });
       return
    }

    res.status(200).json({
      message: "User profile updated successfully",
      user: {
        _id: updatedUser._id,
        email: updatedUser.email,
        profileImage: updatedUser.profileImage,
      },
    });
  } catch (err) {
    console.error("Error updating user profile:", err);
    res.status(500).json({ message: "Internal server error", error: err });
  }
};




export default { register, login, refresh, logout, googleLoginOrRegister, getUserProfile, updateUserProfile };