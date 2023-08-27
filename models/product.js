import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
    title:{
        type:String,
        required:[true, 'Please enter product title'], 
    },
    price:{
        type:Number,
        required:[true, 'Please enter product price'], 
        maxLength:[5, 'max product title character reached'],
        default:0.0
    },
    salePrice:{
        type:Number,
        required:[true, 'Please enter product price'], 
        maxLength:[5, 'max product title character reached'],
        default:0.0
    },
    desc:{
        type:String,
        required:[true, 'Please enter product desc'], 
    },
    ratings:{
        type:Number,
        default:0
    },
    image:{
        type:Array,
    },
    category:[{
        type: mongoose.Types.ObjectId,
        ref: 'Category',
        required:true
    }],
    subCategory:[{
        type: mongoose.Types.ObjectId,
        ref: 'SubCategory',
    }],
    brand:[{
        type: mongoose.Types.ObjectId,
        ref: 'Brand',
        required:true

    }],
    store:[{
        type: mongoose.Types.ObjectId,
        ref: 'Shop',
        required:true

    }],

    seller:{
        type:String,
        required:[true, 'please enter product seller'],
    },
    stock:{
        type:Number,
        required:[true, 'please enter product stock'],
        maxLength:[1000, 'max product length reached'],
        default:0

    },
    numOfReviews:{
        type:Number,
        default:0
    },
    status:{
        type:String,
        default:"Draft"
    },
    reviews:[
        {
            
            user:{
                type:mongoose.Schema.ObjectId,
                ref:"Users",
                required:true
        
            },
            name: {
                type:String,
                required:true,
            },
            rating: {
                type:Number,
                required:true,
            },
            comment: {
                type:String,
                required:true,
            },
            date: {
                type:String,

            }             
        },
        
    ], 
    user:{
        type:mongoose.Schema.ObjectId,
        ref:"Users",
        required:true

    }
    
 
    },
    {timestamps:true}
    );

const Products = mongoose.model('Products', ProductSchema);

export default Products;


