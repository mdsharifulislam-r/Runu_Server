import { Request, Response } from "express";
import { Server, Socket } from "socket.io";
import { socketService } from "./services/socket.service";
import express from "express"
import http from "http"
import cors from 'cors'
import userRouter from "./routes/user.route";
import dotenv from "dotenv"
dotenv.config()

const app = express();
app.use(express.json())
app.use(cors({
  origin:["http://localhost:3000","https://runu.vercel.app"],
  credentials:true
}))
app.use(express.urlencoded({extended:false}))
const server = http.createServer(app); // Create an HTTP server
const io = new Server(server, {
  cors: {
    origin: ["https://runu.vercel.app"], // Allow all origins for simplicity (configure for production)
    methods: ['GET', 'POST']
  }
});

// Serve a test route
app.get('/', (req:Request, res:Response) => {
  res.send('Express server with Socket.IO');
});

// Listen for WebSocket connections
io.on('connection', (socket:Socket) => {
  

  // Listen for a custom event
  socketService(socket,io)
  // Handle disconnections
  
});


app.use("/api/auth",userRouter)
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
