import mongoose from "mongoose";

const ShopSchema = new mongoose.Schema({
            title:{
                type:String,
                unique:true,
                required:[true, 'Please enter product title'], 
                maxLength:[100, 'max shop title character reached']
            },
            desc:{
                type:String,
                required:[true, 'Please enter product price'], 
                maxLength:[5000, 'max shop desc character reached'],
            },
            totalEarning:{
                type:Number,
                default:0.0
            },
            totalSales:{
                type:Number,
                default:0.0
            },
            AvailableBalance:{
                type:Number,
                default:0.0
            },
            pendingPayments:{
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
            supportContact:{
                type:String,
                required:true
            },
            supportEmail:{
                type:String,
                required:true
            },

            paymentInfo:{
                  accountName: {
                    type: String,
                    required: true
                  },
                  accountEmail: {
                    type: String,
                    required: true
                  },
                  accountBankName: {
                    type: String,
                    required: true
                  },
                  accountBankAccount: {
                    type: String,
                    required: true
                  }

            },

           

            ordersArray:[{
                orderId: {
                    type: String,
                    required: true
                  },
                  orderItemName: {
                    type: String,
                    required: true
                  },
                  orderItemPrice: {
                    type: Number,
                    required: true
                  },
                  orderItemTotal: {
                    type: Number,
                    required: true
                  },
                  orderItemImage: {
                    type: String,
                    required: true
                  },
                  orderItemStatus: {
                    type: String,
                    required: true,
                    default: 'Awaiting Payment'
                  },
                  orderItemPaymentStatus: {
                    type: String,
                    required: true,
                    default: 'Not paid'
                  },
                  orderItemDeriveredDate: {
                    type: Date,
                  },
                  orderItemCreatedDate: {
                    type: Date,
                  },
                  sellerPaid: {
                    type: Boolean,
                    default: false
                  }

            }],

            
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
            location:{type: Array},
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
            orderListing:[{
                type: mongoose.Types.ObjectId,
                ref: 'Orders',
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
            following: {type: Array}, // Store all user id of the people that this user is following in an array.
            followers: {type: Array}, // Store all users id of this user's followers in an array.
            ownedBy:{
                type:mongoose.Schema.Types.ObjectId,
                required:true,
                ref:"Users"
            },
    },
    {timestamps:true}
    );

const Shop = mongoose.model('Shop', ShopSchema);

export default Shop;


