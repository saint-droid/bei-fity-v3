import express  from "express";
import ErrorHandler from "../utilis/errorHandler.js"
import APIFeatures from "../utilis/APIfeatures.js"
import * as roles   from "../middlewares/auth.js";
import Category from "../models/Category.js";
import mongoose from "mongoose";
import Address from "../models/Address.js";


const addressRoute = express.Router()


const isAuthenticatedUser = roles.isAuthenticatedUser
const authorizeRoles = roles.authorizeRoles


// get all address

addressRoute.get("/address", isAuthenticatedUser, authorizeRoles('admin', "seller", "superadmin"),  async(req,res, next) => {
   try {
    
    const address = await Address.find().populate('createdBy').sort({ createdAt: -1 })
    const addressCount = await Address.countDocuments()


    res.status(200).json({
        success: true,
        address,
        addressCount,
        message:"This route will show all address"
    })  
    
   } catch (error) {
       res.status(403).json({
           error,
           message:'There was an error ',
           success: false

       })
   }
    
})

// get all address

addressRoute.get("/user/address", isAuthenticatedUser,   async(req,res, next) => {
    const userId = req.user.id

    try {
     
        const address = await Address.aggregate([
            { $match: {'createdBy':  mongoose.Types.ObjectId(userId)}},            
        ])
         res.status(200).json({
             success: true,
             address,
             message:"This route will show all address"
         })  
     
    } catch (error) {
        res.status(403).json({
            error,
            message:'There was an error ',
            success: false
 
        })
    }
     
 })

//  get single address
addressRoute.get("/address/:id", isAuthenticatedUser,   async(req,res, next) => {
    const addressId = req.params.id
    console.log(addressId)
    try {
        const address = await Address.findById(addressId).populate('createdBy');
         res.status(200).json({
             success: true,
             address,
             message:"This route will show all brands of a category"
         })  
     
    } catch (error) {
        res.status(403).json({
            error,
            message:'There was an error ',
            success: false
 
        })
    }
     
 })


///create new address
addressRoute.post("/address", isAuthenticatedUser,  async(req,res, next) => {
 req.body.createdBy = req.user.id
 const defaultBody = req.body.Default

 try {
    const savedAddress = await Address.create(req.body)

    const addressArray = await Address.aggregate([
        // Match messages that belong to the specified chat
        { $match: { _id: mongoose.Types.ObjectId(savedAddress._id) } },
        
        // Join with the Users collection to get the sender's name, username, and email
        {
          $lookup: {
            from: 'users',
            localField: 'createdBy',
            foreignField: '_id',
            as: 'user'
          }
        },
        { $unwind: '$user' },
    ]);

    const address = addressArray.shift()

    
    // const savedAddress = await address.save();
    res.status(200).json(
        {
            success: true,
            address,
            savedAddress,
            message:"Address created successfully"
        }
    )
 } catch (error) {
    res.status(200).json(
        {
            success: false,
            error,
            message:"Address not created"
        }
    ) 
 }
   
})




   ////update address
   addressRoute.put("/address/:id", isAuthenticatedUser,  async(req,res, next) => {
    let address = await Address.findById(req.params.id)
    try {
        if(!address) {
        
            res.status(500).json({
                success: false,
                message:"Category not found"
            })
        }
        await Address.findByIdAndUpdate(req.params.id, req.body,{
            new:true,
            runValidators:true,
            useFindAndModify:false
        })
        res.status(200).json({
            success: true,
            message:"Address updated successfully"
            
        })  
    } catch (error) {
        res.status(500).json({
            error,
            success: false,
            message:"address not updated successfully",
        })
    }
      
   })

   ////delete address
   addressRoute.delete("/address/:id", isAuthenticatedUser, async(req,res, next) => {
    try {
        let address = await Address.findById(req.params.id)
        await address.remove();
        res.status(200).json({
            success: true,
            message:"address deleted successfully",
        }) 
    } catch (error) {
        res.status(500).json({
            error,
            success: false,
            message:"address not deleted successfully",
        })
    }
      
   })


 





export default addressRoute;