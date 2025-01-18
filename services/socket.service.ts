import { Server, Socket } from "socket.io";
import { acceptRequest, addFriends, arrangeFriends, getFriends, getRequest, getUsers, getUsersAll } from "./users.service";
import { MessageType } from "../types/types";
import { getMessage, setMessage } from "./message.service";

export let onlineUser:{userId:number,socketId:string}[] = []
export const socketService = (socket:Socket,io:Server)=>{
    socket.on('join-room',(room:string)=>{
        socket.join(room)
        
        
      })

    socket.on('get-online',(userId:number)=>{
        if(!onlineUser.some(item=>item.userId==userId)){
            onlineUser.push({
                userId:userId,
                socketId:socket.id
            })

           
            
            
        }
    })

    socket.on("message", async (data:{room:string,message:MessageType})=>{
        await setMessage(data.message)
        const messages = await getMessage(data.room)
        await arrangeFriends(data.message.senderId,data.message.reciverId)
        
        socket.to(data.room).emit('last-message',data.message)
        socket.to(data.room).emit('message',messages)
    })

    socket.on('disconnect', () => {
        onlineUser = onlineUser.filter(item=>item.socketId!=socket.id)
       
        
    });

    socket.on('get-users', async (id)=>{
        io.emit('users',onlineUser)
    })

    socket.on("get-message", async ({id,userId}:{id:string,userId:number})=>{
        if(!id.split('').includes(userId.toString())){
            return
        }
        const rows = await getMessage(id)
        socket.emit('get-message',rows)
    })

    socket.on('all-users', async ({id,search})=>{
      
        
        const users = await getUsersAll(id,search)
        io.emit('all-users',users)
    })

    socket.on('add-friend', async (data:{userId:string,senderId:string})=>{
        await addFriends(data.userId,data.senderId)
    })

    socket.on('accept-request', async (data:{userId:string,senderId:string})=>{
        await acceptRequest(data.userId,data.senderId)
    })

    socket.on("get-friends",async (id:string)=>{
        const friends = await getFriends(id)
        socket.emit('get-friends',friends)
    })

    socket.on("get-request",async (id:string)=>{
        const friends = await getRequest(id)
      
        
        socket.emit('get-request',friends)
    })
}

