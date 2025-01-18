export interface UserType{
    name:string,
    image?:string,
    email:string,
    password?:string,
    friends?:string,
    request?:string,
    user_id:number
}

export interface MessageType{
    senderId:string,
    reciverId:string,
    content:any,
    roomId:string,
    type:string,
    seen:boolean,
    message_id?:number
}