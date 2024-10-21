import express, {Request, Response} from "express";
import { check, validationResult } from "express-validator";
import User from "../models/user";
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';

const router = express.Router();

router.post("/login", [
    check("email","Email is required").isEmail(),
    check("password","Password must be of 6 or more character ").isLength({min:6}),

], async (req:Request, res: Response): Promise<void> => {
    const errors= validationResult(req);
    if(!errors.isEmpty()){
        res.status(400).json({message: errors.array()});
        return;
    }
    const {email,password} = req.body;
    try {
        const user=await User.findOne({ email });
        if(!user){
            res.status(400).json({message: "Invalid Credentials"});
            return;
        }
        const isMatch=await bcrypt.compare(password, user.password);
        if(!isMatch){
            res.status(400).json({message : "Invalid credentials"});
            return ;
        }
        const token= jwt.sign({userId: user.id}, process.env.JWT_SECRET_KEY as string,{
            expiresIn: "1d",
        })
        res.cookie("auth_token", token, {
            httpOnly: true,
            secure: process.env.Node_ENV === "production",
            maxAge: 86400000
        })
        res.status(200).json({userId: user._id});
    } catch (error) {
        console.log(error);
        res.status(500).json({mesaage: "Something went wrong"});
        return ;
    }

})
export default router;