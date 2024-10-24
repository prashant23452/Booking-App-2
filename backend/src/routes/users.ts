import express, {Request, Response} from "express";
import User from "../models/user";
import jwt from "jsonwebtoken";
import { check, validationResult } from "express-validator";

const router= express.Router();

// /api/users/register
router.post("/register", [
    check("firstName", "First Name is Requied").isString(),
    check("lastName", "Last Name is Requied").isString(),
    check("email", "Email is Requied").isEmail(),
    check("password", "Password with six or more characters  is Requied").isLength({min:6}),
],async (req:Request, res:Response): Promise<void> => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        res.status(400).json({message: errors.array()});
        return ;
    }
   try{
       let user = await User.findOne({
         email: req.body.email,
       });
       if(user){
        res.status(400).json({ mesaage: "User already exist" });
        return;
       }
       user=new User(req.body);
       await user.save();

       const token=jwt.sign({userId: user.id}, 
        process.env.JWT_SECRET_KEY as string,{
            expiresIn: "1d"
        }
    );
    res.cookie("auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 86400000
    })
   res.status(200).send({message: "User registered ok"}); 
   return;
   }
   catch(error){
      console.log(error);
      res.status(500).send({message: "Something went wrong"});
   }
})

export default router;
