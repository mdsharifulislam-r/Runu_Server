import { Request,Response } from "express";
import { validationResult } from "express-validator";
import bcrypt, { compare } from "bcrypt"
import { UserType } from "../types/types";
import { pool } from "../lib/DB";
import jwt from "jsonwebtoken"
export async function registerUser(req:Request,res:Response):Promise<any> {
    try {
        const errors = validationResult(req)
        if(!errors.isEmpty()){
            return res.status(400).json({
                status:false,
                message:errors.array({onlyFirstError:true}).map(item=>item.msg)
            })
        }
        const user:UserType = req.body

        if(req.body.password.length<8){
            return res.status(400).json({
                status:false,
                message:"Password should be up to 8 character"
            })
        }
        const hashPassword = await bcrypt.hash(user.password!,10)
        const [row]:any[]= await pool.execute('SELECT * FROM users WHERE email=?',[user.email])
        if(row?.length){
            return res.status(400).json({
                status:false,
                message:"Account Already exist"
            })
        }
        
        await pool.execute("INSERT INTO `users`(`name`, `image`, `email`, `password`, `friends`, `request`) VALUES (?,?,?,?,?,?)",[user.name,user?.image||"",user.email,hashPassword,"",""])

        return res.json({
            status:true,
            message:"User created successfully"
        })
    } catch (error) {
        console.log(error);
        
        return res.status(500).send({
            status:false,
            message:"Something went wrong"
        })
    }
}

export async function loginUser(req:Request,res:Response):Promise<any> {
    try {
        const errors = validationResult(req)
        if(!errors.isEmpty()){
            return res.status(400).json({
                status:false,
                message:errors.array().map(i=>i.msg)
            })
        }
        const [row]:any[]= await pool.execute('SELECT name,image,user_id,email,password FROM users WHERE email=?',[req.body.email])
        if(!row?.length){
            return res.status(400).json({
                status:false,
                message:"Account not exist"
            })
        }
        const user:UserType = row[0]
        const match = await compare(req.body.password,user?.password!)
        if(!match){
            return res.status(400).json({
                status:false,
                message:"Invalid Credintials"
            })
        }

        const token = jwt.sign(user?.user_id!.toString(),process.env.JWT_SECRET!)

        const response = res.cookie('auth-token',token,{
            sameSite:"strict"
        })

        delete user?.password
        return response.json({
            status:true,
            message:"Login Successfully",
            data:user
        })

    } catch (error) {
        console.log(error);
        
        return res.status(500).send({
            status:false,
            message:"Something went wrong"
        })
    }
}