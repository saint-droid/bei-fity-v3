import dotenv from 'dotenv';
import http from "http";
import { Server } from "socket.io";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import cloudinary from "cloudinary";
import connectDatabase from "./mongoDb/mongoConnection.js";
import productRoute from "./routes/product.js";
import errorMiddleware from "./middlewares/errors.js";
import authRoute from "./routes/auth.js";
import orderRoute from "./routes/order.js";
import categoryRoute from "./routes/Category.js";
import subcategoryRoute from "./routes/SubCategory.js";
import brandRoute from "./routes/Brand.js";
import walletRoute from "./routes/Wallet.js";
import transactionRoute from "./routes/Transaction.js";
import shopRoute from "./routes/Shop.js";
import addressRoute from "./routes/Address.js";
import messageRoute from "./routes/message.js";
import adminNotificationRoute from "./routes/AdminNotifications.js";
import stripeRoute from "./routes/stripe.js";
import imageRoute from "./routes/Image.js";
import inboxRoute from "./routes/Inbox.js";
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import Inbox from './models/Inbox.js';
// import { WebSocketServer } from 'ws';
import ChatRoute from './routes/Chat.js';
import SingleChatRoute from './routes/singleChat.js';
// import { Expo, ExpoPushMessage, ExpoPushTicket } from 'expo-server-sdk';

// const wss = new WebSocketServer({ port: process.env.PORT_SOCKET || 8080 });
// const expo = new Expo();

dotenv.config();
const PORT = process.env.PORT || 8000;
const NODE_ENV = process.env.NODE_ENV;
connectDatabase();
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// create http server
const server = http.createServer(app);

// create socket.io instance
const io = new Server(server, {
  pingTimeout: 6000,
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});





app.use(express.static('public'));

// attach io instance to app
app.set("io", io);

app.use(
  cors({
    origin: "*",
    methods: ["*"],
  })
);

app.use(cookieParser());

// handle Stripe webhook
app.post(
  "/api/v1/webhook",
  bodyParser.raw({ type: "application/json" }),
  stripeRoute
);

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use("/api/v1", productRoute);
app.use("/api/v1", authRoute);
app.use("/api/v1", orderRoute);
app.use("/api/v1", categoryRoute);
app.use("/api/v1", subcategoryRoute);
app.use("/api/v1", brandRoute);
app.use("/api/v1", walletRoute);
app.use("/api/v1", transactionRoute);
app.use("/api/v1", shopRoute);
app.use("/api/v1", addressRoute);
app.use("/api/v1", messageRoute);
app.use("/api/v1", adminNotificationRoute);
app.use("/api/v1", stripeRoute);
app.use("/api/v1", imageRoute);
app.use("/api/v1", inboxRoute);
app.use("/api/v1", ChatRoute);
app.use("/api/v1", SingleChatRoute);


app.use((req, res, next) => {
  req.app.locals.io = io; // add the io object to app.locals
  next();
});
// app.use(errorMiddleware);

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/app.html');
});

// io.on("connection", (socket, next) => {
//   // console.log("connected to socket");
//   socket.on('setup', (users) => {
//     socket.join(users._id);
//     // console.log(users._id)
//     socket.emit('connected')
    
//   })
//   socket.on('join chat', (room) => {
//     socket.join(room);
//     console.log("user joined room", room)
//     socket.emit('joined chat on')
    
//   })
//   socket.on('new message', (newMessageReceived) => {
//     var chat = newMessageReceived[0].chats[0]
//     console.log("this is the newMessageReceived from top", newMessageReceived)

//     if(!chat.chat.users){ return console.log("chat users not defined")}
//     else{
//       chat.chat.users.forEach(user =>{
//         // socket.in(user._id).emit('message received', newMessageReceived)
        
//         // socket.in(user._id).emit('message received', newMessageReceived)

//           if (user._id  == chat.sender._id) {
//             console.log("yes it is")
//             // socket.in(user._id).emit('message received', newMessageReceived)

//           } else{
//             socket.in(user._id).emit('message received', newMessageReceived)
//           }
//       })
//     }
//     socket.emit('connected')
    
//   })
// });


server.listen(process.env.PORT || 8000, () =>
  console.log(`server is running ${PORT} in ${NODE_ENV} mode`)
  
);
