import express  from "express";
import Products from "../models/product.js";
import ErrorHandler from "../utilis/errorHandler.js"
import APIFeatures from "../utilis/APIfeatures.js"
import * as roles   from "../middlewares/auth.js";
import Category from "../models/Category.js";
import SubCategory from "../models/SubCategory.js";

const subcategoryRoute = express.Router()


const isAuthenticatedUser = roles.isAuthenticatedUser
const authorizeRoles = roles.authorizeRoles





   ////subcategory 
   
    //get all subcategory of category
    subcategoryRoute.get("/subcat",  async(req,res, next) => {
        try {
         const subcategory = await SubCategory.find()
         const subcategoryCount = await SubCategory.countDocuments()

         
         setTimeout(() => {
             res.status(200).json({
                 success: true,
                 subcategory,
                 subcategoryCount,
                 message:"This route will show all subcategory in category"
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

       ////update category
   subcategoryRoute.put("/subcat/:id", isAuthenticatedUser,authorizeRoles('admin', "seller" , "superadmin"), async(req,res, next) => {
    let subcategory = await SubCategory.findById(req.params.id)
    if(!subcategory) {
        res.status(500).json({
            success: false,
            message:"Sub Category not found"
        })
    }
    subcategory = await SubCategory.findByIdAndUpdate(req.params.id, req.body,{
        new:true,
        runValidators:true,
        useFindAndModify:false
    })
    res.status(200).json({
        success: true,
        subcategory,
    })   
   })

   ////delete subcat
   subcategoryRoute.delete("/subcat/:id", isAuthenticatedUser,authorizeRoles('admin', "seller", "superadmin"), async(req,res, next) => {
    let subcategory = await SubCategory.findById(req.params.id)
    if(!subcategory) {
        res.status(500).json({
            success: false,
            message:"Sub Category not found"
        })
    }

    const currentSubcat = await Category.findById(req.body.parentId);
    console.log(currentSubcat)
   
    await SubCategory.remove();
        res.status(200).json({
            success: true,
            message:"sub Category deleted successfully",
        })  
   })

   ///create
   subcategoryRoute.post('/subcategory', isAuthenticatedUser,authorizeRoles('admin', "seller", "superadmin"), (async (req, res) => {
    const category = await Category.findById(req.body.parentId);
    console.log(category)
    req.body.createdBy = req.user.id;

    if (category) {
        const subCategory = new  SubCategory(req.body)

        const savedSubCategory = await subCategory.save();
        await category.updateOne({$push:{subCategory: savedSubCategory}});


        res.status(200).json(savedSubCategory)

        
    } else {
        res.status(403).json("Category not found  ");
        
    }

  



    ///follow user
// router.put('/:id/follow', async(req,res) => {
//     if (req.body.userId  !== req.params.id  ) {
        
//         try {
//             const user = await User.findById(req.params.id);
//             const currentUser = await User.findById(req.body.userId);
//             if (!user.followers.includes(req.body.userId)) {
//                 await user.updateOne({$push:{followers: req.body.userId}});
//                 await currentUser.updateOne({$push:{following: req.body.userId}});
//                 res.status(200).json("you have successfully followed ")

                
//             } else {
//                 res.status(403).json("you are already following ");
                
//             }

//             res.status(200).json(user);

//         } catch (error) {
//             return res.status(500).json( error)
            
//         }
        
//     }else{
//         return res.status(403).json("you cannot follow your account")
//     }

    
// })


}));






export default subcategoryRoute;