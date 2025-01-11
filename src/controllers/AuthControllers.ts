import  { Request, Response , NextFunction} from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from '../models/AuthModel';

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

const register = async (req: Request, res: Response) => {
   const { username, email, password } = req.body;
 
   if (!username || !email || !password) {
   res.status(400).json({ message: 'Username, email, and password are required' });
   return;
   }
 
   const existingUser = await User.findOne({
     $or: [{ username }, { email }]
   });
 
   if (existingUser) {
     if (existingUser.email === email) {
        res.status(400).json({ message: 'Email already in use' });
         return;
     }
 
     if (existingUser.username === username) {
        res.status(400).json({ message: 'Username already in use' });
         return
     }
   }
 
   try {
      const salt = await bcrypt.genSalt(10);
     const hashedPassword = await bcrypt.hash(password, salt);
     const newUser = new User({ username, email, password: hashedPassword });
     await newUser.save();
 
     res.status(201).json(newUser);
   } catch (err) {
     res.status(500).json({ message: 'Internal server error' });
   }
 };
 
 const login = async (req: Request, res: Response) => {
   const { username, email, password } = req.body;
 
   if ((!username && !email) || !password) {
     res.status(400).json({ message: 'Username or email and password are required' });
     return;
   }
 
   try {
     const user = await User.findOne({
       $or: [{ username }, { email }]
     });
     if (!user) {
       res.status(400).json({ message: 'Invalid username or email' });
       return;
     }
 
     const isMatch = await bcrypt.compare(password, user.password);
     if (!isMatch) {
       res.status(400).json({ message: 'Invalid password' });
       return;
     }
 
     const accessToken = jwt.sign(
       { id: user._id },
       process.env.ACCESS_TOKEN_SECRET as string,
       { expiresIn: process.env.JWT_TOKEN_EXPIRATION }
     );

     res.status(200).json({ accessToken });
     return;
   } catch (err) {
     console.error('Error during login:', err);
     res.status(500).json({ message: 'Internal server error' });
     return;
   }
 };
 
 const AuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
   const authHeader = req.headers['authorization'];
   console.log('Authorization Header:', authHeader);
   
   const token = authHeader && authHeader.split(' ')[1];
   console.log('Extracted Token:', token);
   
   if (!token) {
       res.status(401).json({ message: 'Authorization token is missing' });
       return;
   }

   jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string, (err, user) => {
       console.log('JWT Verification Attempt:', { err, user });
       if (err) {
           res.status(403).json({ message: 'Invalid or expired token', error: err.message });
           return;
       }
       req.user = user;
       next();
   });
};



const validateToken = (req: Request, res: Response) => {
   try {
      const authHeader = req.header('Authorization');
      if (!authHeader) {
         res.status(401).json({ message: 'Authorization header is missing' });
         return;
      }

      if (!authHeader.startsWith('Bearer ')) {
         res.status(401).json({ message: 'Invalid Authorization format' });
         return;
      }

      const token = authHeader.split(' ')[1];
      if (!token) {
         res.status(401).json({ message: 'Token is missing' });
         return;
      }

      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string);

      res.status(200).json({ message: 'Token is valid', decoded });
      return;
   } catch (err) {
      console.error('Token validation error:', err);
      res.status(401).json({ message: 'Invalid or expired token' });
      return;
   }
};



export default { register, login , AuthMiddleware, validateToken };
