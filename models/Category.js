import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema({
    title:{
        type:String,
        required:[true, 'Please enter product title'], 
        trim:true,
        unique:true,
        maxLength:[80, 'max product title character reached']
    },
    desc:{
        type:String,
        required:[true, 'Please enter product desc'], 
    },
    CoverImg:{
        type:Array,
        // required:[true, 'Please enter product CoverImg'], 
    },
    
    profileImg:[
        {
            id: {
                type:String,
                required:true
            },
            url: {
                type:String,
                required:true
            }


        }
    ],
    // CoverImg:[
    //     {
    //         public_id: {
    //             type:String,
    //             required:true
    //         },
    //         url: {
    //             type:String,
    //             required:true
    //         }


    //     }
    // ],
    subCategory:{
            type:mongoose.Schema.ObjectId,
            ref:"SubCategory",
    },
    brands:{
        type:mongoose.Schema.ObjectId,
        ref:"Brand",
    },
    createdBy:{
        type:mongoose.Schema.ObjectId,
        ref:"Users",
        required:true

    },
    numOfProducts:{
        type:Number,
        default:0
    },
    
    
 
    },
    {timestamps:true}
    );

const Category = mongoose.model('Category', CategorySchema);

export default Category;


