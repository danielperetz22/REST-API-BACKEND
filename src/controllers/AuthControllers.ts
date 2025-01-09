import  { Request, Response , NextFunction} from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from '../models/AuthModel';

const register = async (req: Request, res: Response) => {
const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;

  if(!username ||!email || !password) {
     res.status(400).json({ message: 'username ,Email and password are required' });
     return
  }
  const user = await User.findOne({username: username});
  if(user) {
     res.status(400).json({ message: 'username already exists' });
     return
  }
  const userenail = await User.findOne({email: email});
  if(userenail) {
     res.status(400).json({ message: 'email already exists' });
     return
  }
    try {
        const newUser = new User(req.body);
        await newUser.save();
         res.status(201).json(newUser);
         return
    } catch (err) {
         res.status(500).json({ message: 'Internal server error' });
         return
    }
};
const login = async (req: Request, res: Response) => {
  const email = req.body.email;
  const password = req.body.password;

  if(!email || !password) {
     res.status(400).json({ message: 'Email and password are required' });
     return
  }
  const user = await User.findOne({email: email});
  if(!user) {
     res.status(400).json({ message: 'Invalid email or password' });
    return
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if(!isMatch) {
     res.status(400).json({ message: 'Invalid email or password' });
     return
  }
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, { expiresIn: '1h' });
   res.status(200).json({ token });
   return
}

export const AuthMiddleware = (req : Request, res : Response, next : NextFunction) => {
    const token = req.header('Authorization');
    if(!token) {
         res.status(401).json({ message: 'Unauthorized' });
         return
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
        req.body.userId = decoded;
    } catch (err) {
         res.status(401).json({ message: 'Unauthorized' });
         return
    }
    next();
}





export default { register, login };
