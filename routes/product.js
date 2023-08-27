import dotenv from 'dotenv';
import express  from "express";
import Products from "../models/product.js";
import ErrorHandler from "../utilis/errorHandler.js"
import APIFeatures from "../utilis/APIfeatures.js"
import * as roles   from "../middlewares/auth.js";
import Category from "../models/Category.js";
import Brand from "../models/Brands.js";
import Images from "../models/Images.js";
import mongoose from "mongoose";
import AdminNotification from "../models/AdminNotifications.js";
import cloudinary from 'cloudinary';
import formidable from "formidable";
import multer from 'multer';
import path from 'path'
import fs from 'fs';
import Users from '../models/user.js';
import Shop from '../models/Shop.js';
import nodemailer  from "nodemailer";
import sendEmail from '../utilis/SendEmail.js';

dotenv.config();

cloudinary.config({
    cloud_name:process.env.CLOUDINARY_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET
});
const productRoute = express.Router()


const isAuthenticatedUser = roles.isAuthenticatedUser
const authorizeRoles = roles.authorizeRoles



const Storage =  multer.diskStorage({
    destination:(req, file, cb) => {
        cb(null, "uploads");
    },
    filename:(req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
    
});

const fileFilter = (req, file, cb) => {
            // cb(null, true)
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/svg+xml'  || file.mimetype === 'image/webp') {
        cb(null, true)
    }
    else{
        console.log('Please upload a valid image file')
        cb({message:"unsupported file format"}, false)

    }
}



const upload = multer({
    storage: Storage,
    limits: {fileSize: 10000000000000000000000000000000000000000000000000000000000},
    fileFilter:fileFilter 
})

const uploads = (file,folder) => {
    return new Promise(resolve => {
        cloudinary.uploader.upload(file,(result) => {
            resolve({
                url: result.url,
                id:result.public_id,
            })
        },{ 
            resource_type:'auto',
            folder:folder
        })

    })
}
   

//get all products

productRoute.get("/products",   async(req,res, next) => {
   try {
    const resPerPage = 30
    const ProductCount = await Products.countDocuments()
    const apifeatures = new APIFeatures(Products.find(), req.query )
                        .search()
                        .filter()
                        .pagination(resPerPage)
    const products = await apifeatures.query;

    // const products = await Products.aggregate([
    //     {
    //         $lookup:
    //         {
    //             from: 'categories',
    //             localField: 'category',
    //             foreignField: '_id',
    //             as: 'category'
    //         },
    //     },
    //     {
    //         $lookup:
    //         {
    //             from: 'brands',
    //             localField: 'brand',
    //              foreignField: '_id',
    //             as: 'brand'
    //         },
    //     }
        
    // ]);

    // console.log("questions=====>", products);    
    // console.log(cat)

        res.status(200).json({
            success: true,
            count:products.length,
            products,
            resPerPage,
            ProductCount,
            message:"This route will show all products in database"
        })  
    
   } catch (error) {
       res.status(403).json({
           error,
           message:'There was an error ',
           success: false

       })
   }
    
})


//get all admin products

productRoute.get("/admin/products",  isAuthenticatedUser, authorizeRoles('admin', "superadmin"),  async(req,res, next) => {
    try {
     const resPerPage = 30
     const publishedProducts = await Products.find({
        "status": { $ne: "Published" } ,
        // "createdAt": { "$gte": new Date(new Date().getTime()-(2*24*60*60*1000)), "$lte": new Date(new Date().getTime()-(24*60*60*1000)),   },
        

     }       
     )

     const yesterProducts = await Products.find({
        "createdAt": { "$gte": new Date(new Date().getTime()-(2*24*60*60*1000)), "$lte": new Date(new Date().getTime()-(24*60*60*1000)),   },
        
     })

     const todayProducts = await Products.find({
        "createdAt": { "$gte": new Date(new Date().getTime()-(24*60*60*1000))  },
        

     })


     const productNotifications = await AdminNotification.find({
        "ProductId": { "$exists": true }
      },
      ).sort({ createdAt: -1 });;

     const ProductCount = await Products.countDocuments()
     const apifeatures = new APIFeatures(Products.find(), req.query )
                         .search()
                         .filter()
                         .pagination(resPerPage)
    //  const products = await apifeatures.query;
 
     const products = await Products.aggregate([
        { $sort: { createdAt: -1 } },
         {
             $lookup:
             {
                 from: 'categories',
                 localField: 'category',
                 foreignField: '_id',
                 as: 'category'
             },
         },
         {
             $lookup:
             {
                 from: 'brands',
                 localField: 'brand',
                 foreignField: '_id',
                 as: 'brand'
             },
         },
         {
            $lookup:
            {
                from: 'shops',
                localField: 'store',
                foreignField: '_id',
                as: 'store'
            },
        },
        { $unwind: '$store' },
        { $unwind: '$brand' },
        { $unwind: '$category' },

         
     ]);

     const productSummary = await Products.aggregate([
        {
        $project: {
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" },
            // totalPrice: 1
        }
        },
        {
        $group: {
            _id: {
            month: "$month",
            year: "$year"
            },
            products: { $sum: 1 },
            // totalEarned: { $sum: "$totalPrice" }
        }
        },
        {
            $sort: {
              "_id.year": -1,
              "_id.month": -1,
            },
          },
      ]);
      
 
     // console.log("questions=====>", products);    
     // console.log(cat)
 
         res.status(200).json({
             success: true,
             count:products.length,
             productSummary:productSummary,
             PublishedCount:publishedProducts.length,
             yesterProducts:yesterProducts.length,
             todayProducts:todayProducts.length,
             products,
             resPerPage,
             ProductCount,
             productNotifications,
             message:"This route will show all products in database"
         })  
     
    } catch (error) {
        res.status(403).json({
            error,
            message:'There was an error ',
            success: false
 
        })
    }
     
 })

//get allseller products

productRoute.get("/user/products", isAuthenticatedUser, authorizeRoles('admin', "seller", "superadmin"),   async(req,res, next) => {

    const userId = req.user.id

    try {
     
        const products = await Products.aggregate([
            { $sort: { createdAt: -1 } },
            { $match: {'user':  mongoose.Types.ObjectId(userId)}},
            {
            $lookup:
                {
                    from: 'categories',
                    localField: 'category',
                    foreignField: '_id',
                    as: 'category'
                },
            },
            {
                $lookup:
                    {
                        from: 'subCategories',
                        localField: 'subCategory',
                        foreignField: '_id',
                        as: 'subCategory'
                    },
                },
            {
            $lookup:
            {
                from: 'brands',
                localField: 'brand',
                foreignField: '_id',
                as: 'brand'
            },
        }              
        ])
 
     // console.log("questions=====>", products);    
     // console.log(cat)
 
     setTimeout(() => {
         res.status(200).json({
             success: true,
             products,
             message:"This route will show all seller products in database"
         })  
     }, 2000);
     
    } catch (error) {
        res.status(403).json({
            error,
            message:'There was an error ',
            success: false
 
        })
    }
     
 })


 productRoute.get("/user/products/:id", isAuthenticatedUser, authorizeRoles('admin', "seller", "superadmin"),   async(req,res, next) => {

    const userId = req.params.id

    try {
     
        const products = await Products.aggregate([
            { $sort: { createdAt: -1 } },
            { $match: {'user':  mongoose.Types.ObjectId(userId)}},
            {
            $lookup:
                {
                    from: 'categories',
                    localField: 'category',
                    foreignField: '_id',
                    as: 'category'
                },
            },
            {
                $lookup:
                    {
                        from: 'subCategories',
                        localField: 'subCategory',
                        foreignField: '_id',
                        as: 'subCategory'
                    },
                },
            {
            $lookup:
            {
                from: 'brands',
                localField: 'brand',
                foreignField: '_id',
                as: 'brand'
            },
        }              
        ])
 
     // console.log("questions=====>", products);    
     // console.log(cat)
 
     setTimeout(() => {
         res.status(200).json({
             success: true,
             products,
             message:"This route will show all seller products in database"
         })  
     }, 2000);
     
    } catch (error) {
        res.status(403).json({
            error,
            message:'There was an error ',
            success: false
 
        })
    }
     
 })
 
///create new products
productRoute.post("/products", isAuthenticatedUser,   authorizeRoles('admin', "seller" , "superadmin"), async(req,res, next) => {
    // console.log("this is the req.body===>",req)


    req.body.user = req.user.id;


    // const userStore = Shop.find()
    const arrayUserStore = await Shop.find({ownedBy: {$in: req.user.id}});
    const userStore = arrayUserStore.shift()



 

   


    try {
        
    // const uploader = async(path) => await uploads(path, 'images')
    // const urls = []
    // const files = req.files
    // console.log("this is the files===>",req.files)


    // for (const file of files){
    //     const {path}= file
    //     const newPath = await uploader(path)
    //     urls.push(newPath)
    //     fs.unlinkSync(path)

    // }
    // console.log("this is the uploaded files===>", urls)
    // req.body.image = urls

    if (userStore  && Object.keys(userStore).length > 0 ) {
        console.log("this is a user store===>", userStore._id)
    req.body.store = userStore._id;


    const products = await Products.create(req.body)
    const adminNoti = await AdminNotification.create({
        ProductId:products._id,
        title:"New Product Created",
        message:`New Product  ${products._id} has been created by ${req.user.email}`
    })


    sendEmail({
        to:'lessin915@gmail.com',
        subject:"New Product Created",
        text:"New Product Created",
        html:`<table cellspacing="0" cellpadding="0" style="padding:30px 10px;background:#eee;width:100%;font-family:arial">
        <tbody>
        <tr>
          <td>
            <table align="center" cellspacing="0" style="max-width:650px;min-width:320px">
              <tbody>
                <tr>
                  <td align="center" style="background:#fff;border:1px solid #e4e4e4;padding:50px 30px">
                  <table align="center">
                    <tbody>
                      <tr>
                      <td style="color:#666666;text-align:center;padding-bottom:30px;font-family:arial">
                        <span style="text-transform:uppercase">
                          <table align="center" style="margin:auto">
                            <tbody>
                                    <tr>
                                        <td style="text-align:center;padding-bottom:5px">
                                            <img align="center" alt="Upsell offer accepted" src="https://ci5.googleusercontent.com/proxy/EzTErfLQ6vBLH6zTJW9Wd8sYEDQVoLh5GuKSvEF4HXE62pssHHtg-HGpOv2oQ-3X44UsgZX1swZ3ba4sGRDrTUUqo_p0gD1bIr0ugLcalJWWuZZuD5KEYdqMmvZq4cQ86etrDKf-0GRd-F9r3NyvhgOoycTgn8Uo3_fEwA=s0-d-e1-ft#https://fiverr-res.cloudinary.com/q_auto,f_auto/v1/general_assets/system_emails/upsell-offer-accepted.png" class="CToWUd" data-bit="iit">
                                        </td>
                                    </tr>
    
                                <tr>
                                    <td style="color:#44ab00;font-size:16px;font-weight:bold;text-align:center;font-family:arial">
                                        Great news: New product #${products._id}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        </span>
    
                      </td>
                      </tr>
                      <tr>
                        <td style="color:#666666;padding:15px">
                          <div style="text-align:right;padding:15px 8px 30px 0px;color:#666666;font-weight:bold;font-size:16px;font-family:arial">
                          New Product ${products.title} has been created by ${req.user.email}
                          </div>
                          <div style="padding-top:10px;text-align:center;font-family:arial">
                              <img alt="Thanks" src="https://ci3.googleusercontent.com/proxy/E7RlYay6X9Fty7PBaixGrw6mrezIS6Fzn2a9fTH_H2M7MSM7N0D9QbBuq_lO7JuCzXAubejq7UXy2sGSJybtj8dDuw6FvYfTt3JHAfDw8ij0tGGfb639CkHKR0N9MxibbXmQaOpd2GmT0hdl-g=s0-d-e1-ft#https://fiverr-res.cloudinary.com/q_auto,f_auto/v1/general_assets/system_emails/thanks.png" class="CToWUd" data-bit="iit">
                              <br>
                              Bei Fity Team
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
    
        <tr>
            <td>
                <table align="center" style="max-width:650px">
    
                    <tbody><tr>
                        <td style="color:#b4b4b4;font-size:11px;padding-top:10px;line-height:15px;font-family:arial">
                            This email was intended for Admin James Nthiga, because you signed up for Bei Fity | <span style="font-family:arial,helvetica neue,helvetica,sans-serif">
                            
                            © Bei Fity International Limited 2010-2023, Bei Fity Inc.
                        </span>
                        </td>
    
                    </tr>
                </tbody></table>
            </td>
        </tr>
        </tbody>
      </table>`
    })

    


    


    // console.log("this is the admin notification", adminNoti)

    const productStore = await Shop.findByIdAndUpdate(userStore._id, { totalProducts: userStore.totalProducts + 1  },{
        new:true,
        runValidators:true,
        useFindAndModify:false
    }) 

    res.status(200).json({
        success: true,
        products,
        message:"Product created successfully"
    })

    } else {
        res.status(401).json({
            success: false,
            message:"You Don't have any store registered. Create your store and then proceed to create product else contacts support for help"
        })   
    }
    

  
 } catch (error) {
    res.status(404).json({
        success: false,
        error,
        message:"Product not created!"
    }) 
 }
 
 
   
})

////update product
productRoute.put("/product/gallery/:id", isAuthenticatedUser,  upload.array('images'), authorizeRoles('admin', "seller", "superadmin"), async(req,res, next) => {
let product = await Products.findById(req.params.id)
if(!product) {
    res.status(500).json({
        success: false,
        message:"Product not found"
    })
}


try {
    const uploader = async(path) => await uploads(path, 'images')
    const urls = []
    const files = req.files
    console.log("this is the files===>",req.files)


    for (const file of files){
        const {path}= file
        const newPath = await uploader(path)
        urls.push(newPath)
        fs.unlinkSync(path)

    }
    console.log("this is the uploaded files===>", urls)
    req.body.image = urls
    product = await Products.findByIdAndUpdate(req.params.id, req.body,{
        new:true,
        runValidators:true,
        useFindAndModify:false
    })
    res.status(200).json({
        success: true,
        product,
    })  
    
} catch (error) {
    res.status(403).json({
        success: false,
        error,
    }) 
}

     
})

////update product images






productRoute.post('/multiple', (req, res) => {
    var form = new formidable.IncomingForm(),
      files = [],
      fields = [];
    form.on('field', function (field, value) {
      console.log('fields is', field);
      fields.push([field, value]);
    });
  
    form.on('file', function (field, file) {
      console.log('i came inside file');
      console.log(file.name);
      const oldPath = file.path;
      const newPath = path.join(__dirname, 'uploads/' + file.name);
      const rawData = fs.readFileSync(oldPath);
      console.log('old path', oldPath);
      fs.writeFileSync(newPath, rawData);
      console.log('file uploaded');
      console.log(JSON.stringify(field));
      files.push([field, file]);
    });
    form.on('end', function () {
      console.log('done');
    });
    form.parse(req);
    console.log(files);
    return res.json(files);
  });



//get single product

productRoute.get("/product/:id",   async(req,res, next) => {


    try {
        const products = await Products.findById(req.params.id)

        const category = await Category.find({_id: {$in: products.category}});
        const brand = await Brand.find({_id: {$in: products.brand}});
        const user = await Users.findById(products.user);
        const gallery = await Images.find({refId: req.params.id});
        res.status(200).json({
            success: true,
            products,
            category,
            gallery,
            user,
            brand
        }) 
    } catch (error) {
        res.status(403).json({
            error,
            message:'Product not found',
            success: false
 
        })
    }
    
   })


   ////update product
   productRoute.put("/product/:id", isAuthenticatedUser, authorizeRoles('admin', "seller", "superadmin"), async(req,res, next) => {
    let product = await Products.findById(req.params.id)
    if(!product) {
        res.status(500).json({
            success: false,
            message:"Product not found"
        })
    }
    product = await Products.findByIdAndUpdate(req.params.id, req.body,{
        new:true,
        runValidators:true,
        useFindAndModify:false
    })
    res.status(200).json({
        success: true,
        product,
    })   
   })

   ////delete product
   productRoute.delete("/product/:id", isAuthenticatedUser,authorizeRoles('admin', "seller", "superadmin"), async(req,res, next) => {
    let product = await Products.findById(req.params.id)
    if(!product) {
        res.status(500).json({
            success: false,
            message:"Product not found"
        })
    }
    await product.remove();
    res.status(200).json({
        success: true,
        message:"Product deleted successfully",
    })   
   })

   productRoute.delete("/many/prods", isAuthenticatedUser,authorizeRoles('admin', "seller", "superadmin"), async(req,res, next) => {
       console.log("body ====>" , req.body.productId )
    const products = await Products.find( { _id: { $in:  [ '627269f9f73f6fdda906d655', '6272635d2fc6317a1420e349' ] } } )
    await Products.deleteMany();
    res.status(200).json({
        success: true,
        message:"Product deleted successfully",
    })  
    
    // if(!product) {
    //     res.status(500).json({
    //         success: false,
    //         message:"Product not found"
    //     })
    // }
    // await Products.remove();
    // res.status(200).json({
    //     success: true,
    //     message:"Product deleted successfully",
    // })   
   })


   ///create new review
   productRoute.put("/review", isAuthenticatedUser, async(req,res, next) => {
       const {rating, comment,date, productId} = req.body
        const d = new Date();
        const now = d.toISOString();
       const review ={ 
           user:req.user._id,
           name:req.user.name,
           rating:Number(rating),
           comment,
           date:now
           

       }
       let product = await Products.findById(productId)
       const isReviewed = product.reviews.find(
           r => r.user.toString() === req.user._id.toString()
       )
       if (isReviewed) {
           product.reviews.forEach(r =>{
               if(review.user.toString() === r.user._id.toString()){
                   r.comment = comment;
                   r.rating = rating

               }
           } )

           
       }else{
           product.reviews.push(review);
           product.numOfReviews = product.reviews.length
       }

       product.ratings = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length
       await product.save({validateBeforeSave: false})
       res.status(200).json({
        success: true,
        message:"Product review added successfully",
    })  

     
   })

//all product reviews
productRoute.get("/all/reviews",  async(req,res, next) => {

  const product = await Products.findById(req.query.id)
  res.status(200).json({
    success: true,
    reviews:product.reviews,
    message:"Product review found successfully",
})  

  
})

//delete product reviews
productRoute.delete("/review",  async(req,res, next) => {

    const product = await Products.findById(req.query.productId)

    const reviews = product.reviews.filter(review => review._id.toString() !== req.query.id.toString())

    const ratings = product.reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length

    const numOfReviews = reviews.length;
    await Products.findByIdAndUpdate(req.query.productId,{
        reviews,
        ratings,
        numOfReviews
    },{
        new:true,
        runValidators:true,
        useFindAndModify:false

    })


    res.status(200).json({
      success: true,
      message:"Product review deleted successfully",
  })  
  
    
  })

export default productRoute;