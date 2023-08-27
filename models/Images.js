import mongoose from "mongoose";

const ImageSchema = new mongoose.Schema({
    title:{
        type:String,
        required:[true, 'Please enter Image title'],
        
    },
    images:{
        type:Array,
        required:[true, 'Please Upload Images ']
    },
    imagesType:{
        type:String,
        required:[true, 'Please enter Image type ']
    },
    refId:{
        type:String,
        required:[true, 'Please enter Refer Id ']

    },
    uploadedBy:{
        type:mongoose.Schema.ObjectId,
        ref:"Users",
        required:true
    }
    
    },
    {timestamps:true}
    );

const Images = mongoose.model('Images', ImageSchema);

export default Images;


