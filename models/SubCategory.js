import mongoose from "mongoose";

const SubCategorySchema = new mongoose.Schema({
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
    
    profileImg:[
        {
            public_id: {
                type:String,
                required:true
            },
            url: {
                type:String,
                required:true
            }


        }
    ],
    CoverImg:[
        {
            public_id: {
                type:String,
                required:true
            },
            url: {
                type:String,
                required:true
            }


        }
    ],
    createdBy:{
        type:String,
        required:[true, 'please enter product seller'],


    },
    parentId:{
        type:String,
        required:[true, 'please enter Category'],


    },
    numOfProducts:{
        type:Number,
        default:0
    },
    
    
 
    },
    {timestamps:true}
    );

const SubCategory = mongoose.model('SubCategory', SubCategorySchema);

export default SubCategory;


