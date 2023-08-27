import mongoose from "mongoose";

const WalletSchema = new mongoose.Schema({
    total:{
        type:Number,
        trim:true,
        default:0.0,
        maxLength:[20000, 'total  character reached']
    },
    Available:{
        type:Number,
        default:0.0,
    },
    usedPay:{
        type:Number,
        default:0.0,
    },
    walletId:{
        type:String,
        required:[true, 'please enter walletId'],

    },
    transactionsId:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Transaction"
    }],
    ownedBy:{
        type:mongoose.Schema.ObjectId,
        ref:"Users",
        required:true

    },   
 
    },
    {timestamps:true}
    );

const Wallet = mongoose.model('Wallet', WalletSchema);

export default Wallet;


