import express  from "express";
import dotenv from 'dotenv';
import Products from "../models/product.js";
import ErrorHandler from "../utilis/errorHandler.js"
import APIFeatures from "../utilis/APIfeatures.js"
import * as roles   from "../middlewares/auth.js";
import Category from "../models/Category.js";
import SubCategory from "../models/SubCategory.js";
import mongoose from "mongoose";
import Brand from "../models/Brands.js";
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


const brandRoute = express.Router()


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

brandRoute.get("/brands",  async(req,res, next) => {
   try {
    
        const brandsCount = await Brand.countDocuments()

        // const brands = await Brand.find()
        const brands = await Brand.aggregate([
            { $sort: { createdAt: -1 } },
            
            // {
            //     $lookup:
            //     {
            //         from: 'categories',
            //         localField: 'subCategory',
            //         foreignField: '_id',
            //         as: 'subCategory'
            //     },
            // },
            {
                $lookup:
                {
                    from: 'categories',
                    localField: '_id',
                    foreignField: 'brands',
                    as: 'categories'
                },
            },
            {
                $lookup: {
                    from: 'products',
                    localField: '_id',
                    foreignField: 'brand',
                    as: "products",
                }
            },
        ]);
        

        res.status(200).json({
            success: true,
            brands,
            brandsCount,
            message:"This route will show all brands"
        })  
    
   } catch (error) {
       res.status(403).json({
           error,
           message:'There was an error ',
           success: false

       })
   }
    
})
brandRoute.get("/brands/category/:id",  async(req,res, next) => {
    const categoryId = req.params.id
    console.log(categoryId)
    try {
        const brands = await Brand.aggregate([
            { $sort: { createdAt: -1 } },
            { $match: {'parentCat': categoryId}},
   
            
        ]);
         res.status(200).json({
             success: true,
             brands,
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

///create new category
brandRoute.post("/brands", isAuthenticatedUser, authorizeRoles('admin', "seller"), upload.array('images'), async(req,res, next) => {
 req.body.createdBy = req.user.id;
 const category = await Category.findById(req.body.parentCat);
    console.log(category)

    if (category) {        
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

            const brand = new  Brand(req.body)
            const savedBrand = await brand.save();
            await category.updateOne({$push:{brands: savedBrand}});
            res.status(200).json(
                {
                    success: true,
                    savedBrand,
                    message:"Brand created successfully"
                }
            ) 
        } catch (error) {
            res.status(500).json(
                {
                    success: true,
                    error,
                    message:"Brand not  created successfully"
                }
            )
        }


       

        
    } else {
        res.status(403).json("Category not found  ");
        
    }
   
})

//get single category

brandRoute.get("/brand/:id",   async(req,res, next) => {
    const brand = await Brand.findById( req.params.id )
    const CatId = (req.params.id)
    console.log(CatId)

    const products = await Products.aggregate([
        { $match: {'brand':  mongoose.Types.ObjectId(CatId)}},
        
    ])

    
    try {
        res.status(200).json({
            success: true,
            brand,
            prodCount:products.length,

            products
        }) 
    } catch (error) {
        res.status(403).json({
            error,
            message:'Brand not found',
            success: false
 
        })
    }


    
   })


////update Brand
brandRoute.put("/brand/:id", isAuthenticatedUser,authorizeRoles('admin', "seller"),  upload.array('images'), async(req,res, next) => {
let brand = await Brand.findById(req.params.id)
if(!brand) {
    res.status(500).json({
        success: false,
        message:"Brand not found"
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
    let brands = await Brand.findByIdAndUpdate(req.params.id, req.body,{
        new:true,
        runValidators:true,
        useFindAndModify:false
    })
    res.status(200).json({
        success: true,
        brands,
        message:"Brand  Updated Successfully"

    })
} catch (error) {
    res.status(500).json({
        success: false,
        error,
        message:"Brand not Updated"
    })
}
   
})

   ////delete product
   brandRoute.delete("/brand/:id", isAuthenticatedUser,authorizeRoles('admin', "seller"), async(req,res, next) => {
    let brand = await Brand.findById(req.params.id)
    if(!brand) {
        res.status(500).json({
            success: false,
            message:"Brand not found"
        })
    }
    await brand.remove();
    res.status(200).json({
        success: true,
        message:"Brand deleted successfully",
    })   
   })


 





export default brandRoute;