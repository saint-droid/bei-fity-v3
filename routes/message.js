import express  from "express";
import * as roles   from "../middlewares/auth.js";
import mongoose from "mongoose";
import Message from "../models/messages.js";


const messageRoute = express.Router()


const isAuthenticatedUser = roles.isAuthenticatedUser
const authorizeRoles = roles.authorizeRoles


//get all category

messageRoute.get("/messages", isAuthenticatedUser, authorizeRoles('admin', "seller" , "superadmin"),   async(req,res, next) => {
   try {
    
    const messages = await Message.aggregate([
        { $sort: { createdAt: -1 } },
        {
        $lookup:
            {
                from: 'users',
                localField: 'userId',
                foreignField: '_id',
                as: 'user'
            },
        },
                    
    ])
    // const messages = await Message.find();
        res.status(200).json({
            success: true,
            messages,
            message:"This route will show all messages for  orders"
        })  
    
   } catch (error) {
       res.status(403).json({
           error,
           message:'There was an error ',
           success: false

       })
   }
    
})


messageRoute.get("/user/messages", isAuthenticatedUser,  async(req,res, next) => {
    
    try {
        const userMessages = await Message.aggregate([
            { $sort: { createdAt: -1 } },
            { $match: {'userId':  mongoose.Types.ObjectId(req.user.id)}},
            {
                $lookup:
                {
                    from: 'orders',
                    localField: 'OrderId',
                    foreignField: '_id',
                    as: 'OrderId'
                },
            }
            
        ]);
         res.status(200).json({
             success: true,
             userMessages,
             message:"This route will show all messages of a user"
         })  
     
    } catch (error) {
        res.status(403).json({
            error,
            message:'There was an error ',
            success: false
 
        })
    }
     
 })




export default messageRoute;