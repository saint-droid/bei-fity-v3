import mongoose from "mongoose";

const InboxSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"Users"
    },
    message:{
        type:String,
        required:true,

    },
    receiver_id:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"Users"
    },
    
    OrderId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Orders"
    },
    isRead:{
        type:Boolean,
        default:false

    },

    },
    {timestamps:true}
    );

const Inbox = mongoose.model('Inbox', InboxSchema);

export default Inbox;


