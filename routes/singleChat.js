import express  from "express";
import * as roles   from "../middlewares/auth.js";
import mongoose from "mongoose";
import Inbox from "../models/Inbox.js";
import Users from "../models/user.js";
import Chat from "../models/Chat.js";
import MessagesModel from "../models/MessageModel.js";
import moment from 'moment';



const SingleChatRoute = express.Router()


const isAuthenticatedUser = roles.isAuthenticatedUser
const authorizeRoles = roles.authorizeRoles


///create new chat
SingleChatRoute.post("/create/chats/messages", isAuthenticatedUser,  async(req,res, next) => {

try {

    if (!req.body.chat && !req.body.message ) {
        res.status(401).json({
            success: false,
            message:"enter message and chat id"
        }) 
        
    } 
    try {
        const createMessage = await MessagesModel.create({
            sender:req.user.id,
            message:req.body.message,
            chat:req.body.chat
        })

        // await createMessage.populate('sender', 'name email username')
        // await createMessage.populate('chat')
        // await createMessage.populate('chat')
        // await Users.populate(createMessage,{
        //     path:'chat.users',
        //     select:'name username email'
        // })




        await Chat.findByIdAndUpdate(req.body.chat, {
            latestMessage:createMessage._id
        })

       
          const userChats = await MessagesModel.aggregate([
            // Match messages that belong to the specified chat
            { $match: { chat: mongoose.Types.ObjectId(req.body.chat) } },
            
            // Join with the Users collection to get the sender's name, username, and email
            {
              $lookup: {
                from: 'users',
                localField: 'sender',
                foreignField: '_id',
                as: 'sender'
              }
            },
            {
              $lookup: {
                from: 'chats',
                localField: 'chat',
                foreignField: '_id',
                as: 'chat'
              }
            },
            { $unwind: '$sender' },
            { $unwind: '$chat' },
            {
              $lookup: {
                from: 'users',
                localField: 'chat.users',
                foreignField: '_id',
                as: 'chat.users'
              }
            },
          
            // Sort messages by updatedAt in descending order
            { $sort: { updatedAt: 1 } },
            
            // Group messages by date using the $group operator
            {
              $group: {
                _id: {
                  $dateToString: {
                    format: '%Y-%m-%d',
                    date: '$updatedAt',
                    timezone: 'UTC'
                  }
                },
                chats: { $push: '$$ROOT' }
              }
            },
          
            // Project a new field to group chats by today, yesterday, and other days
            {
              $project: {
                _id: 1,
                chats: 1,
                group: {
                  $switch: {
                    branches: [
                      {
                        case: { $eq: ['$_id', moment().format('YYYY-MM-DD')] },
                        then: 'Today'
                      },
                      {
                        case: { $eq: ['$_id', moment().subtract(1, 'days').format('YYYY-MM-DD')] },
                        then: 'Yesterday'
                      },
                      {
                        case: true,
                        then: 'Other'
                      }
                    ]
                  }
                }
              }
            },
          
            // Sort groups by date in descending order
            { $sort: { '_id': 1 } }
          ]);
          


        res.status(200).json({
            success: true,
            userChats,
            createMessage,

            message:"Message sent successfully"
        }) 
    } catch (error) {
        res.status(500).json({
            success: false,
            error,
            message:"Message create error"
        }) 
    }
        
    
} catch (error) {
    res.status(500).json({
        success: false,
        error,
        message:"Chat not created"
    })  
}



    
})


///fetch chat messages
SingleChatRoute.get("/chat/messages/:id", isAuthenticatedUser,  async(req,res, next) => {

    try {
    // const userChats = await MessagesModel.find({chat: req.params.id}).populate('sender', 'name username email').populate('chat').sort({updatedAt: -1})
    const userChats = await MessagesModel.aggregate([
        // Match messages that belong to the specified chat
        { $match: { chat: mongoose.Types.ObjectId(req.params.id) } },
        
        // Join with the Users collection to get the sender's name, username, and email
        {
          $lookup: {
            from: 'users',
            localField: 'sender',
            foreignField: '_id',
            as: 'sender'
          }
        },
        {
          $lookup: {
            from: 'chats',
            localField: 'chat',
            foreignField: '_id',
            as: 'chat'
          }
        },
        { $unwind: '$sender' },
        { $unwind: '$chat' },
      
        // Sort messages by updatedAt in descending order
        { $sort: { updatedAt: 1 } },
        
        // Group messages by date using the $group operator
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$updatedAt',
                timezone: 'UTC'
              }
            },
            chats: { $push: '$$ROOT' }
          }
        },
      
        // Project a new field to group chats by today, yesterday, and other days
        {
          $project: {
            _id: 1,
            chats: 1,
            group: {
              $switch: {
                branches: [
                  {
                    case: { $eq: ['$_id', moment().format('YYYY-MM-DD')] },
                    then: 'Today'
                  },
                  {
                    case: { $eq: ['$_id', moment().subtract(1, 'days').format('YYYY-MM-DD')] },
                    then: 'Yesterday'
                  },
                  {
                    case: true,
                    then: 'Other'
                  }
                ]
              }
            }
          }
        },
      
        // Sort groups by date in descending order
        { $sort: { '_id': 1 } }
      ]);
      

    res.status(200).json({
        success: true,
        userChats,
        message:"user all inboxes"
    }) 
            
        
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error,
            message:"Users not found"
        })  
    }
    
    
    
        
})




export default SingleChatRoute;