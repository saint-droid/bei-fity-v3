import mongoose from "mongoose";

const BrandSchema = new mongoose.Schema({
    title:{
        type:String,
        required:[true, 'Please enter brand title'], 
        trim:true,
        unique:true,
        maxLength:[80, 'max brand title character reached']
    },
    desc:{
        type:String,
        required:[true, 'Please enter brand desc'], 
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
    CoverImg:{
        type:Array,
        // required:[true, 'Please enter product CoverImg'], 
    },
    createdBy:{
        type:mongoose.Schema.ObjectId,
        ref:"Users",
        required:true

    },
    parentCat:{
        type:String,
        required:[true, 'please enter Category'],


    },
    
    
    
 
    },
    {timestamps:true}
    );

const Brand = mongoose.model('Brand', BrandSchema);

export default Brand;


