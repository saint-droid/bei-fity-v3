import dotenv from 'dotenv';
import express  from "express";
import Products from "../models/product.js";
import ErrorHandler from "../utilis/errorHandler.js"
import APIFeatures from "../utilis/APIfeatures.js"
import * as roles   from "../middlewares/auth.js";
import Category from "../models/Category.js";
import SubCategory from "../models/SubCategory.js";
import mongoose from "mongoose";
import cloudinary from 'cloudinary';
import formidable from "formidable";
import multer from 'multer';
import path from 'path'
import fs from 'fs';
dotenv.config();

cloudinary.config({
    cloud_name:process.env.CLOUDINARY_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET
});

const categoryRoute = express.Router()


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
    limits: {fileSize: 1000000000000000},
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

//get all category

categoryRoute.get("/categories",  async(req,res, next) => {
   try {
    const CatCount = await Category.countDocuments()

    // const category = await Category.find()
    const category = await Category.aggregate([
        { $sort: { createdAt: -1 } },
        
        {
            $lookup:
            {
                from: 'subcategories',
                localField: 'subCategory',
                foreignField: '_id',
                as: 'subCategory'
            },
        },
        {
            $lookup:
            {
                from: 'brands',
                localField: 'brands',
                foreignField: '_id',
                as: 'brands'
            },
        },
        {
            $lookup: {
                from: 'products',
                localField: '_id',
                foreignField: 'category',
                as: "products",
            }
        },
    ]);
    
    
    setTimeout(() => {
        res.status(200).json({
            success: true,
            category,
            CatCount,
            message:"This route will show all category in database"
        })  
    }, 10);
    
   } catch (error) {
       res.status(403).json({
           error,
           message:'There was an error ',
           success: false

       })
   }
    
})
//get all  user category

categoryRoute.get("/seller/categories", isAuthenticatedUser, authorizeRoles('admin', "seller"),  async(req,res, next) => {
    const userId = req.user.id

    try {
     
     // const category = await Category.find()
     const category = await Category.aggregate([
         { $sort: { createdAt: -1 } },
         { $match: {'createdBy':  mongoose.Types.ObjectId(userId)}},

         {
             $lookup:
             {
                 from: 'subcategories',
                 localField: 'subCategory',
                 foreignField: '_id',
                 as: 'subCategory'
             },
         },
         {
             $lookup:
             {
                 from: 'brands',
                 localField: 'brands',
                 foreignField: '_id',
                 as: 'brands'
             },
         },
         {
             $lookup: {
                 from: 'products',
                 localField: '_id',
                 foreignField: 'category',
                 as: "products",
             }
         },
     ]);
     
     
     setTimeout(() => {
         res.status(200).json({
             success: true,
             category,
             message:"This route will show all category in database"
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



///create new category
categoryRoute.post("/category", isAuthenticatedUser, upload.array('images'), authorizeRoles('admin', "seller"), async(req,res, next) => {
 req.body.createdBy = req.user.id;

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
    req.body.profileImg = urls

    const category = await Category.create(req.body)
    res.status(201).json({
        success: true,
        category,
        message:"Category created successfully"
    })   
 } catch (error) {
    res.status(500).json({
        success: false,
        error,
        message:"Category not created successfully"
    })  
 }


 
   
})

//get single category

   categoryRoute.get("/category/:id",   async(req,res, next) => {
    const category = await Category.findById( req.params.id )
    const CatId = (req.params.id)
    console.log(CatId)
    const resPerPage = 4
    const products = await Products.aggregate([
        { $match: {'category':  mongoose.Types.ObjectId(CatId)}},

        
    ])

    
    try {
        res.status(200).json({
            success: true,
            category,
            prodCount:products.length,
            resPerPage,
            products
        }) 
    } catch (error) {
        res.status(403).json({
            error,
            message:'Category not found',
            success: false
 
        })
    }


    
   })


   ////update category
   categoryRoute.put("/category/:id", isAuthenticatedUser,authorizeRoles('admin', "seller", "superadmin"), upload.array('images'), async(req,res, next) => {
    let category = await Category.findById(req.params.id)
    if(!category) {
        res.status(500).json({
            success: false,
            message:"Category not found"
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
        req.body.CoverImg = urls

        category = await Category.findByIdAndUpdate(req.params.id, req.body,{
            new:true,
            runValidators:true,
            useFindAndModify:false
        })
        res.status(200).json({
            success: true,
            message:"Category updated successfully",
            category,
        })   
    } catch (error) {
        res.status(401).json({
            success: false,
            error,
            message:"Category Update Error",

        })  
    }
    
   })

   ////delete category
   categoryRoute.delete("/category/:id", isAuthenticatedUser,authorizeRoles('admin', "seller", "superadmin"), async(req,res, next) => {
    let category = await Category.findById(req.params.id)
    if(!category) {
        res.status(500).json({
            success: false,
            message:"Category not found"
        })
    }
    await category.remove();
    res.status(200).json({
        success: true,
        message:"Category deleted successfully",
    })   
   })


 





export default categoryRoute;