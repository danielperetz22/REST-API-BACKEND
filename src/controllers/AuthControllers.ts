import  { Request, Response , NextFunction} from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from '../models/AuthModel';

const register = async (req: Request, res: Response) => {
  const email = req.body.email;
  const password = req.body.password;

  if(!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }
  const user = await User.findOne({email: email});
  if(user) {
    return res.status(400).json({ message: 'Email already exists' });
  }
    try {
        const newUser = new User(req.body);
        await newUser.save();
        return res.status(201).json(newUser);
    } catch (err) {
        return res.status(500).json({ message: 'Internal server error' });
    }
};
const login = async (req: Request, res: Response) => {
  const email = req.body.email;
  const password = req.body.password;

  if(!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }
  const user = await User.findOne({email: email});
  if(!user) {
    return res.status(400).json({ message: 'Invalid email or password' });
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if(!isMatch) {
    return res.status(400).json({ message: 'Invalid email or password' });
  }
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, { expiresIn: '1h' });
  return res.status(200).json({ token });
}

export const AuthMiddleware = (req : Request, res : Response, next : NextFunction) => {
    const token = req.header('Authorization');
    if(!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
        req.body.userId = decoded;
    } catch (err) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    next();
}





export default { register, login };
