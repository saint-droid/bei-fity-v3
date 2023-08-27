import mongoose from "mongoose";

const AddressSchema = new mongoose.Schema({
    firstname:{
        type:String,
        required:[true, 'Please enter first name'], 
        
    },
    secondname:{
        type:String,
        required:[true, 'Please enter second name'], 
        
    },
    number:{
        type:String,
        required:[true, 'Please enter number'], 
    },
    phonenumber:{
        type:String,
    },
    address:{
        type:String,
        required:[true, 'Please enter address'], 
    },
    additionalAddress:{
        type:String,
    },
    region:{
        type:String,
        required:[true, 'Please enter region'], 
    },
    city:{
        type:String,
        required:[true, 'Please enter city'], 
    },
    Default:{
        type:Boolean,
        default:false
    },
    createdBy:{
        type:mongoose.Schema.ObjectId,
        ref:"Users",
        required:true

    },

 
    },
    {timestamps:true}
    );

const Address = mongoose.model('Address', AddressSchema);

export default Address;


