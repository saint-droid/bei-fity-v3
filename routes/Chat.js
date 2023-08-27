import express  from "express";
import * as roles   from "../middlewares/auth.js";
import mongoose from "mongoose";
import Inbox from "../models/Inbox.js";
import Users from "../models/user.js";
import Chat from "../models/Chat.js";



const ChatRoute = express.Router()


const isAuthenticatedUser = roles.isAuthenticatedUser
const authorizeRoles = roles.authorizeRoles



///create new mesage
ChatRoute.get("/all/chats", isAuthenticatedUser,  async(req,res, next) => {

try {
   
    
        // const resChats = await Chat.find().populate('users', 'name username email').populate('groupAdmin', 'name username email')
        const resChats = await Chat.aggregate([
            { $sort: { createdAt: -1 } },
             {
                 $lookup:
                 {
                     from: 'users',
                     localField: 'users',
                     foreignField: '_id',
                     as: 'users'
                 },
             },
             {
                 $lookup:
                 {
                     from: 'users',
                     localField: 'groupAdmin',
                     foreignField: '_id',
                     as: 'groupAdmin'
                 },
             },
             {
                $lookup:
                {
                    from: 'messagesmodels',
                    localField: 'latestMessage',
                    foreignField: '_id',
                    as: 'latestMessage'
                },
            }
             
         ]);
    
        res.status(200).json({
            success: true,
            resChats,
            message:"All Chats"
        }) 
        
    
    
    
} catch (error) {
    res.status(500).json({
        success: false,
        error,
        message:"Users not found"
    })  
}



    
})
///create new mesage
ChatRoute.get("/users/search/inbox", isAuthenticatedUser,  async(req,res, next) => {

    try {
        if (req.query.search) {
            const keyword = req.query.search ? {
                $or:[
                    {name: {$regex:req.query.search, $options:'i'} },
                    {username: {$regex:req.query.search, $options:'i'} },
                    {email: {$regex:req.query.search, $options:'i'} },
                ]
            } : {}
        
            const responseUsers = await Users.find(keyword).find({_id:{$ne:req.user._id}})
            
        
            res.status(200).json({
                success: true,
                responseUsers,
                message:"Users fonund on search"
            }) 
            
        } else {
            res.status(401).json({
                success: false,
                message:"enter search query"
            }) 
        }
        
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error,
            message:"Users not found"
        })  
    }
    
    
    
        
    })
    



///fetch chats
ChatRoute.get("/user/inboxs", isAuthenticatedUser,  async(req,res, next) => {

    try {
    const userChats = await Chat.find({users:{$elemMatch:{$eq:req.user.id}}}).populate('users', '-password').populate('groupAdmin', '-password').populate('latestMessage').sort({updatedAt: -1})
    await Users.populate(userChats,{
        path:'latestMessage.sender',
        select:'name username email'
    })
    // const userChats = await Chat.aggregate([
    //     { $match: { users: { $elemMatch: { $eq: req.user.id } } } },
    //     { $lookup: { from: 'users', localField: 'users', foreignField: '_id', as: 'users' } },
    //     { $lookup: { from: 'users', localField: 'groupAdmin', foreignField: '_id', as: 'groupAdmin' } },
    //     { $lookup: { from: 'messages', localField: 'latestMessage', foreignField: '_id', as: 'latestMessage' } },
    //     { $unwind: '$users' },
    //     { $unwind: { path: '$latestMessage', preserveNullAndEmptyArrays: true } },
    //     { $lookup: { from: 'users', localField: 'latestMessage.sender', foreignField: '_id', as: 'latestMessage.sender' } },
    //     { $unwind: { path: '$latestMessage.sender', preserveNullAndEmptyArrays: true } },
    //     { $project: { 'users.password': 0, 'groupAdmin.password': 0 } },
    //     { $sort: { updatedAt: -1 } }
    // ]);

    
      
      

    res.status(200).json({
        success: true,
        userChats,
        message:"user all inboxes"
    }) 
            
        
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error,
            message:"Chats not found"
        })  
    }
    
    
    
        
})
    


///create new chat
ChatRoute.post("/create/chat/:userId", isAuthenticatedUser,  async(req,res, next) => {
    // req.body.userId = req.user.id;
    console.log("this is req.params.userId===>", req.params.userId)
    const chat = await Chat.find({
        isGroupChat:false,
        $and:[
            {users:{$elemMatch:{$eq:req.user.id}}},
            {users:{$elemMatch:{$eq:req.params.userId}}}

        ]
    }).populate('users', '-password').populate('latestMessage');
    await Users.populate(chat,{
        path:'latestMessage.sender',
        select:'name username email'
    })
    
    try {
        if (chat && chat.length > 0) {
            res.status(401).json({
                success: false,
                fullChat:chat[0],
                message:"chat is available"
            }) 
            
        } else {


            try {
                

                const createChat = await Chat.create({
                    chatName:'sender',
                    users:[req.user.id, req.params.userId]
                })

                const fullChat = await Chat.findOne({
                    _id:createChat._id
                }).populate('users', '-password')
        
                res.status(200).json({
                    success: true,
                    fullChat,
                    message:"Chat created successfully"
                }) 
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error,
                    message:"Chat create error"
                }) 
            }
           
        }
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error,
            message:"Chat not created"
        })  
    }
    
    
    
        
    })

///create new chat
ChatRoute.post("/create/group", isAuthenticatedUser,  async(req,res, next) => {
    // req.body.userId = req.user.id;
   
    
    // const users = req.body.users

    try {
        if (!req.body.users || !req.body.name) {
            res.status(401).json({
                success: false,
                message:"select users"
            }) 
        }
        const groupChat = await Chat.create({
            chatName:req.body.name,
            users: [req.user.id, ...req.body.users], 
            isGroupChat:true,
            groupAdmin:req.user.id
        })

        const groupChatRes = await Chat.findOne({
            _id:groupChat._id
        }).populate('users', '-password').populate('groupAdmin', '-password')
        res.status(200).json({
            success: true,
            groupChatRes,
            message:"Group created successfully"
        }) 
    } catch (error) {
        res.status(500).json({
            success: false,
            error,
            message:"Group Chat create error"
        }) 
    }
            
    })




export default ChatRoute;