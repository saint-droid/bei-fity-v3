import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
    shippingInfo:{
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

    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"Users"
    },
    orderItems:{
        type:Array,
        required:true
    },
    paymentInfo:{
        id:{
            type:String
        },
        status:{
            type:String
        }
    },
    deriverySchedule: {
        type:String,
        required:true
        
    },
    itemsPrice: {
        type:Number,
        required:true,
        default:0.0
    },
    deriveryFee: {
        type:Number,
        default:0.0
    },
    totalPrice: {
        type:Number,
        required:true,
        default:0.0
    },
    orderStatus: {
        type:String,
        default:"Awaiting Payment"
    },
    paymentStatus: {
        type:String,
        default:"Not paid"
    },
    payment_intent: {
        type:String,
        default:"not defined"
    },
    paymentMethod: {
        type:String,
        default:"Card Payment"
    },
    OrderId: {
        type:String,
        required:true,
        unique:true,
    },
    deriveredAt: {
        type:Date,
    },
    
 
    },
    {timestamps:true}
    );

const Orders = mongoose.model('Orders', OrderSchema);

export default Orders;


