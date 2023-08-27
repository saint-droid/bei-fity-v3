import mongoose from "mongoose";

const AdminNotificationSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true,

    },
    message:{
        type:String,
        required:true,

    },
    status:{
        type:String,
        default:"unread"
        

    },
    OrderId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Orders"
    },
    ProductId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Products"
    },
    TransactionId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Transaction"
    },
    UserId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Users"
    }
    },
    {timestamps:true}
    );

const AdminNotification = mongoose.model('AdminNotification', AdminNotificationSchema);

export default AdminNotification;


