import { Request, response, Response } from "express";
import { getSingleUsers } from "../services/users.service";
import jwt from 'jsonwebtoken'
import { generateUpdateSql } from "../lib/helper/updateSqlGenerator";
import { pool } from "../lib/DB";
import { UserType } from "../types/types";
import { compare, hash } from "bcrypt";
export async function getSingleUser(req:Request,res:Response):Promise<any> {
    try {
        const id = req.params.id
        const [user]=await getSingleUsers(id)
      
        
        if(!user?.user_id){
            return res.status(404).json({
                status:false,
                message:"User not found"
            })
        }
        
        return res.json(user)
    } catch (error) {
        return res.status(500).send({
            status:false,
            message:"Something went wrong"
        })
    }
}

export async function updateUser(req:Request,res:Response):Promise<any> {
    try {
        const jwtToken = req.headers.authorization
        const userId = jwt.decode(jwtToken!)
        if(req.body.email){
            const [user]:any[] = await pool.execute('SELECT email FROM users WHERE email=? AND user_id!=?',[req.body.email,userId])
            if(user?.length){
                return res.status(400).json({
                    status:false,
                    message:"Email Is Already Exists"
                })
            }
        }

        const {sql,values} = await generateUpdateSql(req.body,"users",userId)
        if(values.length==1){
            return res.status(400).json({
                status:true,
                message:"Invalid Credintals"
            }) 
        }
        await pool.execute(sql,values)

        const [data]:any[] = await pool.execute("SELECT name,email,image,user_id FROM users WHERE user_id=?",[userId])
        return res.json({
            status:true,
            message:"User Update Successfully",
            data:data[0]
        })
        
    } catch (error) {
        console.log(error);
        
        return res.status(500).send({
            status:false,
            message:"Something went wrong"
        })
    }
}

export async function logOutUser(req:Request,res:Response):Promise<any> {
    try {
        const response = res.cookie('auth-token',"")
        return response.json({
            status:true,
            message:"Logout Successfully"
        })
    } catch (error) {
        console.log(error);
        
        return res.status(500).send({
            status:false,
            message:"Something went wrong"
        })
    }
}

export async function changePassword(req:Request,res:Response):Promise<any> {
    try {
        const jwtToken = req.headers.authorization
        const userId = jwt.decode(jwtToken!)
        const {oldPass,newPass}:{oldPass:string,newPass:string}=req.body

        if(!oldPass || !newPass){
            return res.status(400).json({
                status:false,
                message:"invalid Credintials"
            })
        }

        if(newPass.length<8){
            return res.status(400).json({
                status:false,
                message:"Password should be up to 8 character"
            })
        }

        const [rows]:any[]=await pool.execute('SELECT * FROM users WHERE user_id=?',[userId])
        const user:UserType = rows[0]

        const match = await compare(oldPass,user?.password!)
        if(!match){
            return res.status(400).json({
                status:false,
                message:"Password not Match"
            })
        }

        const haspass = await hash(newPass,10)

        await pool.execute('UPDATE users SET password=? WHERE user_id=?',[haspass,userId])

        return res.json({
            status:true,
            message:"Password Reset Successfully"
        })


    } catch (error) {
        console.log(error);
        
        return res.status(500).send({
            status:false,
            message:"Something went wrong"
        })
    }
}