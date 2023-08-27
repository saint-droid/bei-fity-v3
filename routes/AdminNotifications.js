import express  from "express";
import * as roles   from "../middlewares/auth.js";
import mongoose from "mongoose";
import Message from "../models/messages.js";
import AdminNotification from "../models/AdminNotifications.js";


const adminNotificationRoute = express.Router()


const isAuthenticatedUser = roles.isAuthenticatedUser
const authorizeRoles = roles.authorizeRoles


//get all category

adminNotificationRoute.get("/all/admin_notifications", isAuthenticatedUser, authorizeRoles('admin'),   async(req,res, next) => {
   try {
    
    // const notification = await AdminNotification.find().sort ( { status: -1, createdAt: -1} )
    const notification = await AdminNotification.aggregate([
        { $sort: { createdAt: -1 } },
        {
        $lookup:
            {
                from: 'transactions',
                localField: 'TransactionId',
                foreignField: '_id',
                as: 'transactions'
            }
        },
        {
        $lookup:
            {
                from: 'orders',
                localField: 'OrderId',
                foreignField: '_id',
                as: 'orders'
            }
        },
        {
        $lookup:
            {
                from: 'products',
                localField: 'ProductId',
                foreignField: '_id',
                as: 'products'
            }
        },
                    
    ])
    const notification_read = await AdminNotification.find({
        "status":"unread",

    })

        res.status(200).json({
            success: true,
            notification_read:notification_read.length,
            notification,
            message:"This route will show all super admin notification"
        })  
    
   } catch (error) {
       res.status(403).json({
           error,
           message:'There was an error ',
           success: false

       })
   }
    
})

adminNotificationRoute.put("/admin_notifications/:id", isAuthenticatedUser, authorizeRoles('admin'),   async(req,res, next) => {
    try {
     
        let notification = await AdminNotification.findById(req.params.id)
        if(!notification) {
            res.status(500).json({
                success: false,
                message:"notification not found"
            })
        }
        notification = await AdminNotification.findByIdAndUpdate(req.params.id, req.body,{
            new:true,
            runValidators:true,
            useFindAndModify:false
        })   
        
        res.status(200).json({
             success: true,
             notification,
             message:`${notification._id}  updated succesfully`
         })  
     
    } catch (error) {
        res.status(403).json({
            error,
            message:'There was an error ',
            success: false
 
        })
    }
     
 })




export default adminNotificationRoute;