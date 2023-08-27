import express  from "express";
import Shop from "../models/Shop.js";
import Users from "../models/user.js";
import ErrorHandler from "../utilis/errorHandler.js"
import APIFeatures from "../utilis/APIfeatures.js"
import * as roles   from "../middlewares/auth.js";
import Category from "../models/Category.js";
import mongoose from "mongoose";
import Products from "../models/product.js";
import nodemailer  from "nodemailer";
import Brand from "../models/Brands.js";
import SubCategory from "../models/SubCategory.js";

const shopRoute = express.Router()


const isAuthenticatedUser = roles.isAuthenticatedUser
const authorizeRoles = roles.authorizeRoles


//get all shops
shopRoute.get("/shops", isAuthenticatedUser, authorizeRoles('admin', "seller", "superadmin"),  async(req,res, next) => {

    const shopsListing = await Shop.aggregate([
        { $sort: { createdAt: -1 } },
        {
            $lookup:
                {
                    from: 'users',
                    localField: 'ownedBy',
                    foreignField: '_id',
                    as: 'ownedBy'
                },
            
            
        },     
        { $unwind: '$ShopCoverImg' },
        { $unwind: '$ShopProfile' }
    ])


    async function updateShopEarnings(shop){
        console.log("this is the  Id===>", shop)

        const singleShop = await Shop.findById(shop._id)
        if (singleShop) {
            // products.stock = products.stock - quantity;
            // await products.save({validateBeforeSave: false});
            let totalEarnings = 0;
            singleShop.ordersArray.forEach(earn => {
                if(earn.orderItemPaymentStatus == 'Paid'){
                    totalEarnings += earn.orderItemTotal

                }
            } )

            let availableBalance = 0
            singleShop.ordersArray.forEach(earn => {
                const today = new Date();
                const threeDaysInMilliseconds = 3 * 24 * 60 * 60 * 1000; // 3 days in milliseconds
                if(earn.orderItemStatus != 'Processing' &&  earn.orderItemStatus != 'Awaiting Payment' && !earn.sellerPaid &&  today.getTime() - earn.orderItemDeriveredDate.getTime() >= threeDaysInMilliseconds ){
                    availableBalance += earn.orderItemTotal
    
                }
            } )
    
           
    
            let pendingPayment = 0
            singleShop.ordersArray.forEach(earn => {
                const today = new Date();
                const threeDaysInMilliseconds = 3 * 24 * 60 * 60 * 1000; // 3 days in milliseconds
    
                if(earn.orderItemStatus != 'Processing' &&  earn.orderItemStatus != 'Awaiting Payment' && !earn.sellerPaid &&  today.getTime() - earn.orderItemDeriveredDate.getTime() <= threeDaysInMilliseconds    ){
                    pendingPayment += earn.orderItemTotal
    
                }
            } )
    
    
            console.log("stores.pendingPayment", pendingPayment);
    
            console.log("stores.availableBalance", availableBalance);

            console.log("stores.totalEarning", totalEarnings);

            const updatedShop = await Shop.findByIdAndUpdate(shop._id,  { totalEarning: totalEarnings, AvailableBalance: availableBalance, pendingPayments: pendingPayment },{
                new:true,
                runValidators:true,
                useFindAndModify:false
            }).populate('ownedBy', '-password') 
            
        }
        
    }

    shopsListing.forEach(async shop =>{
        await updateShopEarnings(shop)
        

    })

    const shops = await Shop.aggregate([
        { $sort: { createdAt: -1 } },
        {
            $lookup:
                {
                    from: 'users',
                    localField: 'ownedBy',
                    foreignField: '_id',
                    as: 'ownedBy'
                },
            
            
        },     
        { $unwind: '$ShopCoverImg' },
        { $unwind: '$ShopProfile' }
    ])



    

    try {
        res.status(200).json({
            success: true,
            shops,
            message:"Shops found successfully"
        })
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message:"Shops not found "
        })
    }
})


//get all shops
shopRoute.get("/shop/:id", isAuthenticatedUser, authorizeRoles('admin', "seller", "superadmin"),  async(req,res, next) => {

    const shopsListing = await Shop.aggregate([
        // { $sort: { createdAt: -1 } },
        { $match: {'_id':  mongoose.Types.ObjectId(req.params.id)}},

        {
            $lookup:
                {
                    from: 'users',
                    localField: 'ownedBy',
                    foreignField: '_id',
                    as: 'ownedBy'
                },
            
            
        },     
        { $unwind: '$ShopCoverImg' },
        { $unwind: '$ShopProfile' }
    ])



    async function updateShopEarnings(shop){
        console.log("this is the  Id===>", shop)

        const singleShop = await Shop.findById(shop._id)
        if (singleShop) {
            // products.stock = products.stock - quantity;
            // await products.save({validateBeforeSave: false});
            let totalEarnings = 0;
            singleShop.ordersArray.forEach(earn => {
                if(earn.orderItemPaymentStatus == 'Paid'){
                    totalEarnings += earn.orderItemTotal

                }
            } )

            let availableBalance = 0
            singleShop.ordersArray.forEach(earn => {
                const today = new Date();
                const threeDaysInMilliseconds = 3 * 24 * 60 * 60 * 1000; // 3 days in milliseconds
                if(earn.orderItemStatus == 'Package delivered' && !earn.sellerPaid &&  today.getTime() - earn.orderItemDeriveredDate.getTime() >= threeDaysInMilliseconds ){
                    availableBalance += earn.orderItemTotal
    
                }
            } )
    
           
    
            let pendingPayment = 0
            singleShop.ordersArray.forEach(earn => {
                const today = new Date();
                const threeDaysInMilliseconds = 3 * 24 * 60 * 60 * 1000; // 3 days in milliseconds

                // const date = today.getTime() - earn.orderItemDeriveredDate.getTime();
                // console.log("this is the date===>", date)
    
                if(earn.orderItemStatus == 'Package delivered' && !earn.sellerPaid &&  today.getTime() - earn.orderItemDeriveredDate.getTime() <= threeDaysInMilliseconds    ){
                    pendingPayment += earn.orderItemTotal
    
                }
            } )
    
    
            console.log("stores.pendingPayment", pendingPayment);
    
            console.log("stores.availableBalance", availableBalance);

            console.log("stores.totalEarning", totalEarnings);

            const updatedShop = await Shop.findByIdAndUpdate(shop._id,  { totalEarning: totalEarnings, AvailableBalance: availableBalance, pendingPayments: pendingPayment },{
                new:true,
                runValidators:true,
                useFindAndModify:false
            }).populate('ownedBy', '-password') 
            
        }
        
    }

    shopsListing.forEach(async shop =>{
        await updateShopEarnings(shop)

    })

    const Singleshop = await Shop.aggregate([
        { $match: {'_id':  mongoose.Types.ObjectId(req.params.id)}},


        {
            $lookup:
                {
                    from: 'users',
                    localField: 'ownedBy',
                    foreignField: '_id',
                    as: 'ownedBy'
                },
            
            
        },     
        { $unwind: '$ShopCoverImg' },
        { $unwind: '$ShopProfile' },
        { $unwind: '$ownedBy' }

    ])

    function calculateProfileCompleteness(shops) {
    let completeness = 0;


    
    shops.forEach((shop) => {
        if (shop.title) {
        completeness += 10;
        }
        if (shop.desc) {
        completeness += 10;
        }
        if (shop.supportContact) {
        completeness += 10;
        }
        if (shop.supportEmail) {
        completeness += 10;
        }
        if (shop.ShopProfile.length > 0) {
        completeness += 20;
        }
        if (shop.ShopCoverImg.length > 0) {
        completeness += 20;
        }
        if (shop.location.length > 0) {
        completeness += 20;
        }
    });
    
    return completeness;
    }

          
    // console.log("this is the completeness ====>",completeness)
    const completeness = calculateProfileCompleteness(shopsListing);


    const shop = Singleshop.shift()

    const brandListing = await Brand.aggregate([
        // { $sort: { createdAt: -1 } },
        { $match: {'createdBy':  mongoose.Types.ObjectId(shop.ownedBy && shop.ownedBy._id)}},

        {
            $lookup:
                {
                    from: 'users',
                    localField: 'createdBy',
                    foreignField: '_id',
                    as: 'createdBy'
                },
            
            
        },
        {
            $lookup:
                {
                    from: 'categories',
                    localField: 'parentCat',
                    foreignField: '_id',
                    as: 'categories'
                },
            
            
        },
          
          
        { $unwind: '$createdBy' },

    ])
    const subCategoryListing = await SubCategory.aggregate([
        // { $sort: { createdAt: -1 } },
        { $match: {'createdBy':  mongoose.Types.ObjectId(shop.ownedBy && shop.ownedBy._id)}},

        // {
        //     $lookup:
        //         {
        //             from: 'users',
        //             localField: 'createdBy',
        //             foreignField: '_id',
        //             as: 'createdBy'
        //         },
            
            
        // },
          
        // { $unwind: '$createdBy' },

    ])
    
    const categoryListing = await Category.aggregate([
        // { $sort: { createdAt: -1 } },
        { $match: {'createdBy':  mongoose.Types.ObjectId(shop.ownedBy && shop.ownedBy._id)}},

        {
            $lookup:
                {
                    from: 'users',
                    localField: 'createdBy',
                    foreignField: '_id',
                    as: 'createdBy'
                },
            
            
        },
          
        { $unwind: '$createdBy' },

    ])



    try {
        res.status(200).json({
            success: true,
            completeness,
            brandListing,
            categoryListing,
            subCategoryListing,
            shop,
            message:"Shop found successfully"
        })
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error,
            message:"Shop not found "
        })
    }
})




//get logged in seller shop
shopRoute.get("/seller/shop", isAuthenticatedUser, authorizeRoles('admin', "seller" ),  async(req,res, next) => {
    // const shops = await Shop.findById({ownedBy: req.user.id })

    




    const shops = await Shop.aggregate([
    { $match: {'ownedBy':  mongoose.Types.ObjectId(req.user.id)}},

    {
        $lookup:
            {
                from: 'users',
                localField: 'ownedBy',
                foreignField: '_id',
                as: 'ownedBy'
            },
        
        
    }              
    ])



    try {

        

        function calculateProfileCompleteness(shops) {
        let completeness = 0;


        
        shops.forEach((shop) => {
            if (shop.title) {
            completeness += 10;
            }
            if (shop.desc) {
            completeness += 10;
            }
            if (shop.supportContact) {
            completeness += 10;
            }
            if (shop.supportEmail) {
            completeness += 10;
            }
            if (shop.ShopProfile.length > 0) {
            completeness += 20;
            }
            if (shop.ShopCoverImg.length > 0) {
            completeness += 20;
            }
            if (shop.location.length > 0) {
            completeness += 20;
            }
        });
        
        return completeness;
        }

          
        // console.log("this is the completeness ====>",completeness)
        const completeness = calculateProfileCompleteness(shops);

        const userShop = shops.shift() 

        let totalEarnings = 0;
        userShop.ordersArray.forEach(earn => {
            if(earn.orderItemPaymentStatus == 'Paid'){
                totalEarnings += earn.orderItemTotal

            }
        } )

        let availableBalance = 0
        userShop.ordersArray.forEach(earn => {
            const today = new Date();
            const threeDaysInMilliseconds = 3 * 24 * 60 * 60 * 1000; // 3 days in milliseconds
            if(earn.orderItemStatus != 'Processing' &&  earn.orderItemStatus != 'Awaiting Payment' && !earn.sellerPaid &&  today.getTime() - earn.orderItemDeriveredDate.getTime() >= threeDaysInMilliseconds ){
                availableBalance += earn.orderItemTotal

            }
        } )

       

        let pendingPayment = 0
        userShop.ordersArray.forEach(earn => {
            const today = new Date();
            const threeDaysInMilliseconds = 3 * 24 * 60 * 60 * 1000; // 3 days in milliseconds

            if(earn.orderItemStatus != 'Processing' &&  earn.orderItemStatus != 'Awaiting Payment' && !earn.sellerPaid &&  today.getTime() - earn.orderItemDeriveredDate.getTime() <= threeDaysInMilliseconds    ){
                pendingPayment += earn.orderItemTotal

            }
        } )


        console.log("stores.pendingPayment", pendingPayment);

        console.log("stores.availableBalance", availableBalance);


       
        // console.log("updatedShop", updatedShop);


        ///get each store ratings


        const storeProduct = await Products.aggregate([
            { $match: {'store':  userShop._id}},
        
                        
        ])

        let totalRatings = 0;
        let numRatings = 0;
        let averageStoreRating = 0;

        storeProduct.forEach(product => {
            if (product.ratings > 0) {
            totalRatings += product.ratings;
            numRatings++;
            }
        });

        if (numRatings > 0) {
          averageStoreRating =  totalRatings / numRatings;
        } else {
             
        }

        console.log('ratingValue ====>', averageStoreRating)
        const updatedShop = await Shop.findByIdAndUpdate(userShop._id,  { totalEarning: totalEarnings, ratings: averageStoreRating, AvailableBalance: availableBalance, pendingPayments: pendingPayment },{
            new:true,
            runValidators:true,
            useFindAndModify:false
        }).populate('ownedBy', '-password') 

        
          
        res.status(200).json({
            success: true,
            completeness,
            updatedShop,
            message:"seller Shop found successfully"
        })
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error,
            message:"Shop not found.Please login or contact support "
        })
    }
})

///create a shop 
shopRoute.post("/shop/create", isAuthenticatedUser, authorizeRoles('admin', "seller", "superadmin"), async (req, res, next)=>{
    req.body.ownedBy = req.user.id
    
    const shops = await Shop.aggregate([
        { $match: {'ownedBy':  mongoose.Types.ObjectId(req.user.id)}}
                     
    ])


        try {
        if(shops.length === 0){
        const shop = await Shop.create(req.body)
        res.status(200).json({
            shop,
            success: true,
            message: ' Shop details created successfully',
            
        })
        }else{
            res.status(500).json({
                success: false,
                message: ' This account has a store created already. Contact support for more information',
                
            })  
        }
        } catch (error) {
            res.status(404).json({
                error,
                success: false,
                message: ' Shop  not  created. Ensure that you have entered the correct details ',
                
            }) 
        }
        
    

    

})

 ////delete shop
 shopRoute.delete("/shop/:id", isAuthenticatedUser,authorizeRoles('admin', "seller", "superadmin"), async(req,res, next) => {
    let shop = await Shop.findById(req.params.id)
    if(!shop) {
        res.status(500).json({
            success: false,
            message:"Shop not found"
        })
    }
    await shop.remove();
    res.status(200).json({
        success: true,
        message:"Shop deleted successfully",
    })   
   })

   ///follow store 
shopRoute.put("/shop/:shop_id/follow",  isAuthenticatedUser, async(req,res, next) => {

    let shop = await Shop.findById(req.params.shop_id)
    if(!shop) {
        res.status(500).json({
            success: false,
            message:"Shop not found"
        })
    }

    let user = await Users.findById(req.user.id)
    if(!user) {
        res.status(500).json({
            success: false,
            message:"User not found"
        })
    }


    try {
        // let followers = await Shop.find({ followers: { $in: req.user.id } })
        
        let whoFollowedMe = await Shop.findByIdAndUpdate({ _id: req.params.shop_id},
            { $push: { followers: req.user.id } }
        )
        return res.status(200).send({whoFollowedMe, message: "User Follow Success"});

           
        } catch (e) {
            return res.status(500).send({ message: "User Follow Failed", data: e.message });
        }
      
    })

    shopRoute.put("/shop/:shop_id/unfollow",  isAuthenticatedUser, async(req,res, next) => {

        let shop = await Shop.findById(req.params.shop_id)
        if(!shop) {
            res.status(500).json({
                success: false,
                message:"Shop not found"
            })
        }
    
        let user = await Users.findById(req.user.id)
        if(!user) {
            res.status(500).json({
                success: false,
                message:"User not found"
            })
        }
    
    
        try {
            let followers = await Shop.find({ followers: { $in: req.user.id } })
            let unFollow = await Shop.updateOne({ _id: req.params.shop_id}, {$pull: { followers:{ user: req.user.id}}})
            return res.status(200).send({unFollow, message: "User Unfollowed successfully"});
    
               
               
            } catch (e) {
                return res.status(500).send({ message: "User Follow Failed", data: e.message });
            }
          
        })

////update product
shopRoute.put("/shop/:id", isAuthenticatedUser, authorizeRoles('admin', "seller", "superadmin"), async(req,res, next) => {
let shop = await Shop.findById(req.params.id)
if(!shop) {
    res.status(500).json({
        success: false,
        message:"shop not found"
    })
}
else{


 const shops = await Shop.findByIdAndUpdate(req.params.id, req.body,{
    new:true,
    runValidators:true,
    useFindAndModify:false
})
res.status(200).json({
    success: true,
    shops,
    message:"Shop  found and updated successfully"
}) 
}  
})


//get all shops admin
shopRoute.get("/admin/shops", isAuthenticatedUser, authorizeRoles('admin',"superadmin"),  async(req,res, next) => {

    const shopsListing = await Shop.aggregate([
        { $sort: { createdAt: -1 } },
        {
            $lookup:
                {
                    from: 'users',
                    localField: 'ownedBy',
                    foreignField: '_id',
                    as: 'ownedBy'
                },
            
            
        },     
        { $unwind: '$ShopCoverImg' },
        { $unwind: '$ShopProfile' },
        { $unwind: '$ownedBy' }              
              
    ])

    const shopsLength = await Shop.countDocuments()

    async function updateShopEarnings(shop){
        console.log("this is the  Id===>", shop)

        const singleShop = await Shop.findById(shop._id)
        if (singleShop) {
            // products.stock = products.stock - quantity;
            // await products.save({validateBeforeSave: false});
            let totalEarnings = 0;
            singleShop.ordersArray.forEach(earn => {
                if(earn.orderItemPaymentStatus == 'Paid'){
                    totalEarnings += earn.orderItemTotal

                }
            } )

            const storeProduct = await Products.aggregate([
                { $match: {'store':  shop._id}},
            
                            
            ])
    
            let totalRatings = 0;
            let numRatings = 0;
    
            storeProduct.forEach(product => {
                if (product.ratings > 0) {
                totalRatings += product.ratings;
                numRatings++;
                }
            });
    
            let averageStoreRating = 0;
            if (numRatings > 0) {
              averageStoreRating =  totalRatings / numRatings;
            } else {
                 
            }
    

            // console.log("stores.totalEarning", totalEarnings);

            const updatedShop = await Shop.findByIdAndUpdate(shop._id,  { totalEarning: totalEarnings, ratings:averageStoreRating },{
                new:true,
                runValidators:true,
                useFindAndModify:false
            }).populate('ownedBy', '-password') 
            
        }
        
    }

    shopsListing.forEach(async shop =>{
        await updateShopEarnings(shop)
        
    })

    const shops = await Shop.aggregate([
        { $sort: { createdAt: -1 } },
        {
            $lookup:
                {
                    from: 'users',
                    localField: 'ownedBy',
                    foreignField: '_id',
                    as: 'ownedBy'
                },
            
            
        },     
        { $unwind: '$ShopCoverImg' },
        { $unwind: '$ShopProfile' }
    ])


    let storesEarnings = 0;
    shops.forEach(shop => {
        storesEarnings += shop.totalEarning

        
    } )



    try {
        res.status(200).json({
            success: true,
            storesEarnings,
            shops,
            shopsLength,
            message:"Shops found successfully"
        })
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message:"Shops not found "
        })
    }
})


export default shopRoute;