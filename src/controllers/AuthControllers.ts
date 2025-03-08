import { Request, Response, NextFunction } from 'express';
import Post from "../models/PostModel";
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
const generateTokens = (_id: string): { refreshToken: string; accessToken: string } | null => {
  if (!process.env.ACCESS_TOKEN_SECRET) {
    console.error("Missing ACCESS_TOKEN_SECRET environment variable.");
    return null;
  }

  const rand = Math.random();
  const accessToken = jwt.sign(
    { _id: _id, rand: rand },
    process.env.ACCESS_TOKEN_SECRET as string,  
    { expiresIn: process.env.TOKEN_EXPIRATION || '1h' } 
  );

  const refreshToken = jwt.sign(
    { _id: _id, rand: rand },
    process.env.ACCESS_TOKEN_SECRET as string,      
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRATION || '7d' } 
  );

  return { refreshToken, accessToken };
};


const register = async (req: Request, res: Response) => {
  const { email, password, username } = req.body;
  const profileImage = req.file?.path || ""; 

  if (!email || typeof email !== "string") {
    res.status(400).json({ message: "Email is required and must be a string" });
    return;
  }
  if (!password || typeof password !== "string") {
    res.status(400).json({ message: "Password is required and must be a string" });
    return;
  }
  if (!username || typeof username !== "string") {  
    res.status(400).json({ message: "Username is required and must be a string" });
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
      username,
      password: hashedPassword,
      profileImage, 
    });

    // 🚨 יצירת טוקנים כמו ב-login
    const tokens = generateTokens(user._id as string);
    if (!tokens) {
      console.log("❌ Failed to generate tokens for user:", user._id);
      res.status(500).json({ message: "Failed to generate tokens" });
      return;
    }

    // 🚨 שמירת רענון טוקן במשתמש
    user.refeshtokens = user.refeshtokens || [];
    user.refeshtokens.push(tokens.refreshToken);
    await user.save();

    console.log("✅ Registration Data Sent to Frontend:", {
      ...tokens,
      user: {
        _id: user._id,
        email: user.email,
        username: user.username,
        profileImage: user.profileImage,
      },
    });

    res.status(201).json({
      ...tokens,
      user: {
        _id: user._id,
        email: user.email,
        username: user.username,
        profileImage: user.profileImage ||"/src/assets/profile-default.jpg" , 
      },
    });

    return;
  } catch (err) {
    console.error("❌ Error in register:", err);
    res.status(500).json({ message: "Internal server error", error: err });
  }
};


const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    console.log("Login request received with email:", email);

    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required" });
      return;
    }

    const user = await userModel.findOne({ email });

    if (!user) {
      console.log("User not found for email:", email);
      res.status(400).json({ message: "Invalid email or password" });
      return;
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      console.log("Invalid password for email:", email);
      res.status(400).json({ message: "Invalid email or password" });
      return;
    }

    const tokens = generateTokens(user._id as string);
    if (!tokens) {
      console.log("Failed to generate tokens for user:", user._id);
      res.status(500).json({ message: "Failed to generate tokens" });
      return;
    }

    if (!user.refeshtokens) {
      user.refeshtokens = [];
    }
    user.refeshtokens.push(tokens.refreshToken);
    await user.save();

    console.log("Login success for user:", {
      _id: user._id,
      email: user.email, 
      username: user.username,
      profileImage: user.profileImage,
    });

    res.status(200).json({
      ...tokens,
      _id: user._id,
      email: user.email, 
      username: user.username || "Unknown", 
      profileImage: user.profileImage || "https://example.com/default-avatar.jpg", 
    });
  } catch (err) {
    console.error("Error during login:", err);
    res.status(500).json({ message: "Error during login", error: err });
  }
};

const validateRefreshToken = (refreshToken: string | undefined) => {
  return new Promise<Document<unknown, {}, IUser> & IUser>((resolve, reject) => {
    if (!refreshToken) {
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
      if (!userId) {
      
        reject("error");
        return;
      }
     
      try {
        const user = await userModel.findById(userId);
        if (!user) {
         
          reject("error");
          return;
        }

        if (!user.refeshtokens || !user.refeshtokens.includes(refreshToken)) {
        
          reject("error");
          return;
        }
     
        resolve(user);
      } catch (err) {
       
        reject(err);
      }
    });
  });
};



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

    user.refeshtokens = user.refeshtokens!.filter((token) => token !== req.body.refreshToken);
    await user.save();
    res.status(200).send("logged out");
  } catch (err) {
    res.status(400).send("error");
    return;
  }
};

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const tokenHeader = req.headers["authorization"];
  const token = tokenHeader && tokenHeader.split(" ")[1];
  if (!token) {
    res.status(400).send("Access denied: Missing token");
    return;
  }
  if (!process.env.ACCESS_TOKEN_SECRET) {
    res.status(500).send("Server error: Missing token secret");
    return;
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, payload) => {
    if (err) {
      res.status(400).send("Access denied: Invalid token");
      return;
    }

    try {
      const user = await userModel.findById((payload as Payload)._id)
      .select("_id email username profileImage");
      if (!user) {
        res.status(404).send("User not found");
        return;
      }
      req.user = { 
        _id: user._id, 
        email: user.email, 
        username: user.username, 
        profileImage: user.profileImage 
      };
      next();
    } catch (error) {
      res.status(500).send("Server error");
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
        username: name || email,
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

    if (!user.refeshtokens) {
      user.refeshtokens = [];
    }
    user.refeshtokens.push(tokens.refreshToken);
    await user.save();


    res.status(200).json({
      ...tokens,
      user: {
        _id: user._id,
        email: user.email,
        username: user.username,
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
  ? `https://node24.cs.colman.ac.il/uploads/${user.profileImage}`
  : "https://example.com/default-avatar.jpg";

    res.status(200).json({
      _id: user._id,
      username: user.username,
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
      console.log("Error: No user ID found in request");
       res.status(400).json({ message: "Invalid user ID" });
       return;
    }

    const currentUser = await userModel.findById(userId);
    if (!currentUser) {
      console.log("User not found in DB");
      res.status(404).json({ message: "User not found" });
      return;
    }

    const { username, email, oldPassword, confirmNewPassword, newPassword } = req.body;
    const updates: Partial<IUser> = {};

    if (username && username.trim() !== "") {
      updates.username = username.trim();
    }

    if (req.file) {
      const profileImagePath = `uploads/${req.file.filename}`;
      updates.profileImage = profileImagePath;
    }

    if (email && email.trim() !== "") {
      const newEmail = email.trim();
      if (newEmail !== currentUser.email) {
        const userWithSameEmail = await userModel.findOne({ email: newEmail });
        if (userWithSameEmail?._id && userWithSameEmail._id.toString() !== userId.toString()) {

          res.status(400).json({ message: "Email already in use" });
          return;
        }
        updates.email = newEmail;
      }
    }

    if (newPassword && newPassword.trim() !== "") {
      if (newPassword !== confirmNewPassword) {
        res.status(400).json({ message: "New passwords do not match" });
        return;
      }
      const hasLocalPassword = currentUser.password && currentUser.password.trim() !== "";
      if (hasLocalPassword) {
        if (!oldPassword) {
           res.status(400).json({ message: "Old password is required to change password" });
           return;
        }
        const isMatch = await bcrypt.compare(oldPassword, currentUser.password);
        if (!isMatch) {
          res.status(400).json({ message: "Incorrect old password" });
          return;
        }
      }
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword.trim(), salt);
      updates.password = hashedPassword;
    }

    if (Object.keys(updates).length === 0) {
      res.status(400).json({ message: "No updates provided" });
      return;
    }

    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    );
    if (!updatedUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const profileImageUrl = updatedUser.profileImage
      ? `https://node24.cs.colman.ac.il/uploads/${updatedUser.profileImage.replace(/\\/g, "/")}`
      : "https://node24.cs.colman.ac.il/uploads/default-avatar.jpg"; 

    await Post.updateMany(
      { owner: userId },
      {
        username: updatedUser.username,
        email: updatedUser.email,
        userProfileImage: updatedUser.profileImage ? updatedUser.profileImage.replace(/\\/g, "/") : ""
      }
    );


    const responseData = {
      message: "User profile updated successfully, and posts updated!",
      user: {
        _id: updatedUser._id,
        email: updatedUser.email,
        username: updatedUser.username,
        profileImage: profileImageUrl,
      },
    };

    res.status(200).json(responseData);
    return;
  } catch (err) {
    console.error("Error in updateUserProfile:", err);
    res.status(500).json({
      message: "Internal server error",
      error: err instanceof Error ? err.message : String(err),
    });
    return;
  }
};





export default { register, login, refresh, logout, googleLoginOrRegister, getUserProfile, updateUserProfile };