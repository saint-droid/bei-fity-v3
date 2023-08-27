
import express  from "express";
import Products from "../models/product.js";
import ErrorHandler from "../utilis/errorHandler.js"
import APIFeatures from "../utilis/APIfeatures.js"
import * as roles   from "../middlewares/auth.js";
import Category from "../models/Category.js";
import SubCategory from "../models/SubCategory.js";
import mongoose from "mongoose";
import Wallet from "../models/Wallet.js";
import Transaction from "../models/Transactions.js";
import Users from "../models/user.js";


const walletRoute = express.Router()


const isAuthenticatedUser = roles.isAuthenticatedUser
const authorizeRoles = roles.authorizeRoles


//get all wallets

walletRoute.get("/wallet",  async(req,res, next) => {
   try {
    
    // const wallet = await Wallet.find()
    const wallet = await Wallet.aggregate([
        { $sort: { updatedAt: -1 } },
        
        {
            $lookup:
            {
                from: 'transactions',
                localField: 'transactionsId',
                foreignField: '_id',
                as: 'transactions'
            },
        },
        {
            $lookup:
            {
                from: 'users',
                localField: 'ownedBy',
                foreignField: '_id',
                as: 'user'
            },
        },
        { $unwind: '$user' },
    ]);
    
    
    setTimeout(() => {
        res.status(200).json({
            success: true,
            wallet,
            message:"This route will show all wallets in database"
        })  
    }, 1000);
    
   } catch (error) {
       res.status(403).json({
           error,
           message:'There was an error ',
           success: false

       })
   }
    
})


walletRoute.get("/wallet/:id",  async(req,res, next) => {
    try {
     
    //  const wallet = await Wallet.findById(req.params.id)


    const walletArray = await Wallet.aggregate([
        // Match messages that belong to the specified chat
        { $match: { _id: mongoose.Types.ObjectId(req.params.id) } },
        
        // Join with the Users collection to get the sender's name, username, and email
        {
          $lookup: {
            from: 'transactions',
            localField: 'transactionsId',
            foreignField: '_id',
            as: 'transactions'
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'ownedBy',
            foreignField: '_id',
            as: 'ownedBy'
          }
        },
        // {
        //     $lookup: {
        //       from: 'users',
        //       localField: 'transactions.user',
        //       foreignField: '_id',
        //       as: 'transactions.user'
        //     }
        //   },
        { $unwind: '$ownedBy' },

      
        
        { $sort: { createdAt: -1 } },

      ])

    //   const wallet = walletArray.shift();

    //   const walletArray = await Wallet.find({_id:req.params.id}).populate('ownedBy', '-password').populate('transactionsId').sort({createdAt: -1})
    await Users.populate(walletArray,{
        path:'transactions.user',
    })      
    
    const wallet = walletArray.shift();

     
   
    res.status(200).json({
        success: true,
        wallet,
        message:"This route will show single wallet in database"
    })  
     
    } catch (error) {
        res.status(403).json({
            error,
            message:'There was an error ',
            success: false
 
        })
    }
     
 })

///activate new wallet
walletRoute.post("/wallet", isAuthenticatedUser,  async(req,res, next) => {
 req.body.ownedBy = req.user.id;
 const userId = await req.user.id
 req.body.walletId = req.user.walletId;

//  const user = await Users.find({ _id: userId})
//  console.log(user)

 await Users.updateOne({ _id: userId}, {$set: {isWalletActive: true}}, {
    new:true,
    runValidators:true,
    useFindAndModify:false
} )


 const wallet = await Wallet.create(req.body)
 res.status(201).json({
    success: true,
    wallet,
    message:"wallet activated successfully"
})
   
})

//get user wallet and tarnsactions

walletRoute.get("/user/wallet", isAuthenticatedUser,  async(req,res, next) => {
    const userId = req.user.id
    const wallet = await Wallet.find({ownedBy: userId})
    const TransactionId = await (wallet[0].ownedBy)
    const transactions = await Transaction.aggregate([
        { $sort: { createdAt: -1 } },
        {$match:{user: TransactionId}}
    ])
    // const transactions = await Wallet.aggregate([
    //     { $sort: { createdAt: -1 } },
        
    //     {
    //         $lookup:
    //         {
    //             from: 'transactions',
    //             localField: 'transactionsId',
    //             foreignField: '_id',
    //             as: 'transactions'
    //         },
    //     },
    // ]);
    
    
    try {
        res.status(200).json({
            success: true,
            wallet,
            transactions,
            message:'Your Wallet was found  successfully ',

            
        }) 
    } catch (error) {
        res.status(403).json({
            error,
            message:'Wallet not found',
            success: false
 
        })
    }


    
   })




//  ///pay an order  with wallet

// walletRoute.post("/wallet/pay", isAuthenticatedUser,  async(req,res, next) => {
//     req.body.ownedBy = req.user.id;
//     req.body.walletId = req.user.walletId;
   
//     const wallet = await Wallet.create(req.body)
//     res.status(201).json({
//        success: true,
//        wallet,
//        message:"wallet activated successfully"
//    })
      
//    })
   






export default walletRoute;