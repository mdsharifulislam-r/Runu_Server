import { Request, Response } from "express";
import jwt from "jsonwebtoken";
export async function authToken(req:Request,res:Response,next:()=>void):Promise<any> {
    try {
        const token = req.headers.authorization
        const verify = jwt.verify(token!,process.env.JWT_SECRET!)
        if(verify){
            next()
        }else{
            return res.status(400).json({
                status:false,
                message:"Token is expired"
            })
        }
    } catch (error) {
        return res.status(500).json({
            status:false,
            message:"Token is expired"
        })
    }
}