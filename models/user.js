import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"
import crypto from "crypto";


const UserSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true, 'Please enter name'], 
        trim:true,
        maxLength:[50, 'max User name character reached']
    },
    username:{
        type:String,
        required:[true, 'Please enter User name'], 
        trim:true,
        unique:true,
        maxLength:[20, 'max User name character reached']
    },
    walletId: {
        type:String,
        required:[true, 'Please enter walletId'], 
        unique:true,

    },
    isWalletActive: {
        type:Boolean,
        default:false 

    },
    email:{
        type:String,
        required:[true, 'Please enter Email'], 
        unique:true,
        validate:[validator.isEmail, 'Please enter valid Email']

    },
    password:{
        type:String,
        required:[true, 'Please enter Password'], 
        minlength:[5, 'max password length not reached'],
        select:false

    },
    avatar: {
        type:String,
        required:true, 
    },
    contact: {
        type:String,
    },


    role:{
        type:String,
        default:"User"
    },
    shop:[

    {
        title:{
            type:String,
            required:[true, 'Please enter product title'], 
            maxLength:[100, 'max product title character reached']
        },
        desc:{
            type:String,
            required:[true, 'Please enter product price'], 
            maxLength:[5000, 'max product title character reached'],
        },
        totalSales:{
            type:Number,
            maxLength:[5000, 'max product title character reached'],
            default:0.0
        },
        AvailableBalance:{
            type:Number,
            default:0.0
        },
        
        totalProducts:{
            type:Number,
            maxLength:[500000, 'max product title character reached'],
            default:0
        },
        totalOrders:{
            type:Number,
            maxLength:[50000, 'max product title character reached'],
            default:0
        },
        
        ratings:{
            type:Number,
            default:0
        },
        ShopProfile:[
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
        ShopCoverImg:[
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
        category:[{
            type: mongoose.Types.ObjectId,
            ref: 'Category',
        }],
        subCategory:[{
            type: mongoose.Types.ObjectId,
            ref: 'SubCategory',
        }],
        brand:[{
            type: mongoose.Types.ObjectId,
            ref: 'Brand',
    
        }],
    
        
       
        numOfReviews:{
            type:Number,
            default:0
        },
        reviews:[
            {
                
                user:{
                    type:mongoose.Schema.ObjectId,
                    ref:"Users",
                    required:true
            
                },
                name: {
                    type:String,
                    required:true,
                },
                rating: {
                    type:Number,
                    required:true,
                },
                comment: {
                    type:String,
                    required:true,
                },
                date: {
                    type:String,
    
                }             
            },
            
        ], 
        previousCustomers: {
            type:String,
        },
        
    }
    ],
    devices: [
        {
            deviceName: String,
            os: String,
            osVersion: String,
            appVersion: String,
            lastLoggedIn: Date,
            ip: String,
        },
    ],
    resetPasswordToken: String,
    resetPasswordExpire:Date,
    emailSettings:{
        orderEmails:{
            type:Boolean,
            default:false  
            
        },
        generalUpdates:{
            type:Boolean,
            default:false  
            
        },
        paymentUpdates:{
            type:Boolean,
            default:false  
            
        },

        
    },

    
 
    },
    {timestamps:true}
    );

    ///encrypting pasword
    UserSchema.pre("save", async function (next){
        if(!this.isModified('password')){
            next()

        }
        this.password = await bcrypt.hash(this.password, 10)
    })

    ///return JWT token
    UserSchema.methods.getJwtToken = function (){
        return jwt.sign({id: this._id }, process.env.JWT_SECRET,{
            expiresIn: process.env.JWT_EXPIRES_TIME
        })
     }

     ///compare user password
     UserSchema.methods.comparePassword = async function (enteredPassword){
        return await bcrypt.compare(enteredPassword, this.password)
     }

     ///generate password reset tokens
     UserSchema.methods.GetResetPasswordToken = async function(){
         //generate token 
         const resetToken = crypto.randomBytes(20).toString('hex');

         ///hash password and set to  reset token
         this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

         ///set token expire time

         this.resetPasswordExpire = Date.now() + 30 * 60 * 1000

         return resetToken;

     }
    

const Users = mongoose.model('Users', UserSchema);

export default Users;


