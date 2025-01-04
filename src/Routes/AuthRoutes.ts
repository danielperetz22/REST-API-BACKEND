import express from "express";
const router = express.Router();
import AuthControllers from "../controllers/AuthControllers";


router.post("/register", AuthControllers.register);
router.post("/login", AuthControllers.login);

export default router;