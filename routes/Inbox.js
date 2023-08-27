import express  from "express";
import * as roles   from "../middlewares/auth.js";
import mongoose from "mongoose";
import Inbox from "../models/Inbox.js";



const inboxRoute = express.Router()


const isAuthenticatedUser = roles.isAuthenticatedUser
const authorizeRoles = roles.authorizeRoles


//get all mesages

inboxRoute.get("/inbox", isAuthenticatedUser,  async(req,res, next) => {
   try {
    const userRole = req.user.role;
    const id = req.user.id;

    if (userRole == 'admin' ) {
        const inbox = await Inbox.aggregate([
            { $sort: { createdAt: -1 } },
            {
                $lookup:
                {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            {
                $lookup:
                {
                    from: 'users',
                    localField: 'receiver_id',
                    foreignField: '_id',
                    as: 'receiver'
                }
            },
            {
                $lookup:
                {
                    from: 'orders',
                    localField: 'OrderId',
                    foreignField: '_id',
                    as: 'order'
                }
            },
                        
        ])
        req.app.get("io").to(id).emit("getInbox", inbox);


        res.status(200).json({
            success: true,
            inbox,
            message:"This route will show all inboxs for admin"
        })  
    } else {
        const inbox = await Inbox.aggregate([
            { $match: { receiver_id: mongoose.Types.ObjectId(id) } },
            { $sort: { createdAt: -1 } },
            {
                $lookup:
                {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            {
                $lookup:
                {
                    from: 'users',
                    localField: 'receiver_id',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            {
                $lookup:
                {
                    from: 'orders',
                    localField: 'OrderId',
                    foreignField: '_id',
                    as: 'order'
                }
            },
                        
        ])
        req.app.get("io").to(id).emit("getInbox", inbox);

        res.status(200).json({
            success: true,
            inbox,
            message:"This route will show  inboxs filtered by role"
        })  

        
    }
    
   } catch (error) {
       res.status(403).json({
           error,
           message:'There was an error ',
           success: false

       })
   }
    
})

///create new mesage
inboxRoute.post("/inbox", isAuthenticatedUser,  async(req,res, next) => {
req.body.userId = req.user.id;

try {
    if (req.user.id == req.body.receiver_id ) {
        res.status(401).json({
            success: false,
            message:"You cannot message Yourself!"
        }) 
        
    } else {
        const sentMessage = await Inbox.create(req.body)
        // Emit the new message to the receiver's socket
        req.app.get("io").to(req.body.receiver_id).emit("newMessage", sentMessage);
        req.app.get("io").emit("getInbox");

        res.status(200).json({
            success: true,
            sentMessage,
            message:"Message sent successfully"
        }) 
    }
    
} catch (error) {
    res.status(500).json({
        success: false,
        error,
        message:"Message not sent"
    })  
}



    
})

//fetch two users conversation
inboxRoute.get("/user_conversation/:otherUserId", isAuthenticatedUser, async (req, res, next) => {
    try {
      const currentUser = req.user.id;
      const otherUser = req.params.otherUserId;
  
      const conversation = await Inbox.aggregate([
        {
          $match: {
            $or: [
              { userId: mongoose.Types.ObjectId(currentUser), receiver_id: mongoose.Types.ObjectId(otherUser) },
              { userId: mongoose.Types.ObjectId(otherUser), receiver_id: mongoose.Types.ObjectId(currentUser) }
            ]
          }
        },
        {
          $sort: { createdAt: 1 }
        },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "sender",
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "receiver_id",
            foreignField: "_id",
            as: "receiver",
          },
        },
        {
          $lookup: {
            from: "orders",
            localField: "OrderId",
            foreignField: "_id",
            as: "order",
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$createdAt",
              },
            },
            conversation: {
              $push: "$$ROOT",
            },
          },
        },
      ]);

      const io = req.app.get("io");
      io.emit("conversationData", conversation);

  
      res.status(200).json({
        success: true,
        conversation,
        message: "This route will show the conversation between two users",
      });
    } catch (error) {
      res.status(403).json({
        error,
        message: "There was an error",
        success: false,
      });
    }
});



inboxRoute.get("/inbox/updates/:since", isAuthenticatedUser, async (req, res) => {
  const since = req.params.since;
  const messages = await Inbox.find({ createdAt: { $gt: since } }).populate('userId', 'name').populate('receiver_id', 'name').sort({ createdAt: -1 });
  res.json(messages);
});

   




export default inboxRoute;