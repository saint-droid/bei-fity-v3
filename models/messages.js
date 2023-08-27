import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"Users"
    },
    message:{
        type:String,
        required:true,

    },
    title:{
        type:String,
        required:true,

    },
    OrderId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Orders"
    }
    },
    {timestamps:true}
    );

const Message = mongoose.model('Message', MessageSchema);

export default Message;


