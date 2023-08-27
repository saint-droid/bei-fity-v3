import dotenv from 'dotenv';
import express  from "express";
import ErrorHandler from "../utilis/errorHandler.js"
import APIFeatures from "../utilis/APIfeatures.js"
import * as roles   from "../middlewares/auth.js";
import mongoose from "mongoose";
import Images from "../models/Images.js";
import multer from 'multer';
import path from 'path'
const imageRoute = express.Router()
import fs from 'fs';
// import cloudinary from '../cloudinary.js'
import cloudinary from 'cloudinary';
dotenv.config();

cloudinary.config({
    cloud_name:process.env.CLOUDINARY_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET
});

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
    




imageRoute.post("/upload_images", upload.single('prodImage'),  async(req,res,  next) => {
    // console.log("this is the req file====>", req.file)

    try {
        const newImage = new Images({
            title: req.body.title,
            image:{
                data:req.file.filename,
                contentType:req.file.mimetype,
                url:Date.now() + path.extname(req.file.originalname),

            }
        })
        const savedImage =  await newImage.save()
            res.status(200).json(
                {
                    success: true,
                    savedImage,
                    message:"Image Uploaded successfully"
                }
            ) 
                         
     } catch (error) {
        res.status(500).json({
            success: true,
            error,
            message:"Image not Uploaded successfully"
        })  
     }
    

    
})

imageRoute.post("/uploads", isAuthenticatedUser,  upload.array('images'),  async(req,res,  next) => {

        const uploader = async(path) => await uploads(path, 'images')
        const urls = []
        const files = req.files

        for (const file of files){
            const {path}= file
            const newPath = await uploader(path)
            urls.push(newPath)
            fs.unlinkSync(path)

        }
        if (urls) {
            const newImage = new Images({
                title: req.body.title,
                images:urls,
                uploadedBy: req.user.id,
                imagesType:'Product',
                refId:req.body.refId
    
            })
            const savedImage =  await newImage.save()
    
    
            res.status(200).json({
                success: true,
                savedImage,
                message:"Image  Uploaded successfully"
            }) 
            
        }else{
            console.log("no images urls found")
        }
       
        
        console.log("this is gallery url===>", urls)
             
    //  } catch (error) {
    //     res.status(500).json({
    //         success: false,
    //         error,
    //         message:"Image not Uploaded successfully"
    //     })  
    //  }
    

    
})

imageRoute.get("/uploads",  async(req,res, next) => {
    try {
     
     const images = await Images.find()
         res.status(200).json({
             success: true,
             images,
             message:"This route will show all files and documents  uploaded"
         })  
     
    } catch (error) {
        res.status(403).json({
            error,
            message:'There was an error ',
            success: false
 
        })
    }
     
 })

 





export default imageRoute;