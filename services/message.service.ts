import { pool } from "../lib/DB";
import { MessageType } from "../types/types";

export async function setMessage(message:MessageType) {
    try {
        await pool.execute("INSERT INTO `messages`( `senderId`, `reciverId`, `content`, `roomId`, `type`, `seen`) VALUES (?,?,?,?,?,?)",[message.senderId,message.reciverId,message.content,message.roomId,message.type,false])
    } catch (error) {
        console.log(error);
        
    }
}

export async function getMessage(id:string) {
    try {
        const [rows] = await pool.execute('SELECT * FROM messages WHERE roomId=?',[id])
        return rows
    } catch (error) {
        console.log(error);
        
    }
}