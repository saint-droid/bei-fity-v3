import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"Users"
    },
    amount:{
        type:Number,
        required:true,

    },
    OrderId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Orders"
    },
    walletId:{
        type:String,
        required:true,
    },
    status:{
        type:String,
        default:"Failed"
    },
    reason:{
        type:String,
        default:"Wallet Top up"
    },
    paymentId:{
        type:String,
        required:true,
    }
 
    },
    {timestamps:true}
    );

const Transaction = mongoose.model('Transaction', TransactionSchema);

export default Transaction;


