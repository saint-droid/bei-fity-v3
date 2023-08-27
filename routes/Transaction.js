
import express  from "express";
import Products from "../models/product.js";
import ErrorHandler from "../utilis/errorHandler.js"
import APIFeatures from "../utilis/APIfeatures.js"
import * as roles   from "../middlewares/auth.js";
import Category from "../models/Category.js";
import SubCategory from "../models/SubCategory.js";
import mongoose from "mongoose";
import Wallet from "../models/Wallet.js";
import Transaction from "../models/Transactions.js";
import Orders from "../models/order.js";
import Message from "../models/messages.js";
import twilio  from "twilio";
const Twilio = new twilio('AC410e8d6e1fb0c0f0a5158357f179bc38',  "25f3c0a54cbb0cb5d1859f48884f9e26");
import nodemailer  from "nodemailer";
import Users from "../models/user.js";
import AdminNotification from "../models/AdminNotifications.js";
import Shop from "../models/Shop.js";
import sendEmail from "../utilis/SendEmail.js";

const transactionRoute = express.Router()


const isAuthenticatedUser = roles.isAuthenticatedUser
const authorizeRoles = roles.authorizeRoles


//get all ransactions

transactionRoute.get("/transactions",authorizeRoles('admin', "seller", "superadmin"),  async(req,res, next) => {
   try {
        // const transactions = await Transaction.find().sort({_id:-1});
        const transactions = await Transaction.aggregate([
            { $sort: { createdAt: -1 } },
            {
            $lookup:
                {
                    from: 'users',
                    localField: 'user',
                    foreignField: '_id',
                    as: 'user'
                },
            },
                        
        ])
    
    
    setTimeout(() => {
        res.status(200).json({
            success: true,
            transactions,
            message:"This route will show all transactions in database"
        })  
    }, 1000);
    
   } catch (error) {
       res.status(403).json({
           error,
           message:'There was an error ',
           success: false

       })
   }
    
})


//get single ransactions

transactionRoute.get("/transactions/:id",authorizeRoles('admin', "seller", "superadmin"),  async(req,res, next) => {
    try {
        //  const transaction = await Transaction.find({_id:req.params.id}).populate('users', '-password').sort({_id:-1});
        //  await Users.populate(transaction,{
        //     path:'user',
        // })
        
        const transactionArray = await Transaction.aggregate([
            { $match: { _id: mongoose.Types.ObjectId(req.params.id) } },
            
            {
              $lookup: {
                from: 'users',
                localField: 'user',
                foreignField: '_id',
                as: 'users'
              }
            },
            
 
            { $unwind: '$users' },
    
          
            
            { $sort: { createdAt: -1 } },
    
          ])
    
    
              
        
        const transaction = transactionArray.shift();
         
         res.status(200).json({
             success: true,
             transaction,
             message:"This route will show single transaction"
         })  
     
    } catch (error) {
        res.status(403).json({
            error,
            message:'There was an error for show single transaction',
            success: false
 
        })
    }
     
 })


//get admin statistics

transactionRoute.get("/admin/transactions", authorizeRoles('admin'),  async(req,res, next) => {
    try {
        //  const transactions = await Transaction.find({reason:"Wallet Top up"})
         const transactions = await Transaction.aggregate([
            { $sort: { createdAt: -1 } },
            {
            $lookup:
                {
                    from: 'users',
                    localField: 'user',
                    foreignField: '_id',
                    as: 'user'
                },
            },
                        
        ])

        if (req.query.limit) {
            const resPerPage = req.query.limit
            const apifeatures = new APIFeatures(Transaction.find(), req.query )
                                .search()
                                .filter()
                                .pagination(resPerPage)
            var transactionsList = await apifeatures.query;
            
        } else {
             var transactionsList = await Transaction.aggregate([
                { $sort: { createdAt: -1 } },
                {
                $lookup:
                    {
                        from: 'users',
                        localField: 'user',
                        foreignField: '_id',
                        as: 'user'
                    },
                },
                            
            ])
    
        }
        



         const transactionsOut = await Transaction.find({reason:"Order payment"})

        //  const date =new Date();
        //Daily earnings


         const todayTransaction = await Transaction.find({
            // "reason": { $ne: "Order payment" } ,
            "createdAt": { "$gte": new Date(new Date().getTime()-(24*60*60*1000))  },
            

         }
            
         )

         console.log('todayTransaction=====>', todayTransaction);

         let totalTodayTransactions = 0;
         todayTransaction.forEach(transaction => {
            totalTodayTransactions += transaction.amount
         } )

        //Daily earnings


         const yesterTransaction = await Transaction.find({
            "reason": { $ne: "Order payment" } ,
            "createdAt": { "$gte": new Date(new Date().getTime()-(2*24*60*60*1000)), "$lte": new Date(new Date().getTime()-(24*60*60*1000)),   },
            

         }
            
         )

         let totalYesterTransactions = 0;
         yesterTransaction.forEach(transaction => {
            totalYesterTransactions += transaction.amount
         } )
         


         ///weekly amounts
         const weeklyTransaction = await Transaction.find({
            "reason": { $ne: "Order payment" } ,
            "createdAt": { "$gte": new Date(new Date().getTime()-(7*24*60*60*1000))  }
         }
            
         )

         let totalWeeklyTransactions = 0;
         weeklyTransaction.forEach(transaction => {
            totalWeeklyTransactions += transaction.amount
         } )


        ///Monthly amounts
        const monthlyTransaction = await Transaction.find({
            "reason": { $ne: "Order payment" } ,
            "createdAt": { "$gte": new Date(new Date().getTime()-(30*24*60*60*1000))  }
        }
            
        )

        let totalMonthlyTransactions = 0;
        monthlyTransaction.forEach(transaction => {
            totalMonthlyTransactions += transaction.amount
        } )

        console.log(totalMonthlyTransactions)




         let totalTransactions = 0;
         transactions.forEach(transaction => {
            totalTransactions += transaction.amount
         } )

         let totalTransactionsOut = 0;
         transactionsOut.forEach(transactionsOut => {
            totalTransactionsOut += transactionsOut.amount
         } )

     
     
     
     
     setTimeout(() => {
         res.status(200).json({
             success: true,
             transactionsList,
             totalYesterTransactions,
             totalTodayTransactions,
             totalWeeklyTransactions,
             totalMonthlyTransactions,
             totalTransactionsOut,
             totalTransactions,
             message:"This route will show all transactions amount in database"
         })  
     }, 1000);
     
    } catch (error) {
        res.status(403).json({
            error,

            message:'There was an error ',
            success: false
 
        })
    }
     
 })


 ///create new transaction
transactionRoute.post("/transaction", isAuthenticatedUser, async(req,res, next) => {
 req.body.user = req.user.id;
 req.body.walletId = req.user.walletId
//  const transaction = await Transaction.create(req.body)
const walletToken = await req.user.walletId
 
if(walletToken){
    const wallet = await Wallet.find({ walletId: walletToken})
    const walletTotal = await (wallet[0].total)
   

    console.log(walletTotal)
    var first = parseInt(walletTotal);
    

    var second = parseInt(req.body.amount);
    var sum = Number(first += second);
    

    const transaction = await Transaction.create(req.body)
    // await wallet.updateOne({$push:{transactionsId: transaction._id}});
    const newWallet = await Wallet.updateOne({ walletId: walletToken}, {$set: {total: sum, Available:sum }}, {
        new:true,
        runValidators:true,
        useFindAndModify:false
    } )
    // const transaction = await Transaction.create(req.body)
    // // await wallet.updateOne({$push:{transactionsId: transaction._id}});
    const transId = await transaction._id
    await Wallet.updateOne({ walletId: walletToken}, {$push: { transactionsId: transId}})

    await AdminNotification.create({
        TransactionId:transaction._id,
        title:"New Payment",
        message:`
        New payment  ${transaction._id} has been Created   .
        `
        })
     res.status(201).json({
     success: true,
     transaction,
     message:"transaction created successfully"
     })


}else{
    res.status(500).json({
        success:false,
        message:"transaction creation failed"
    })
}

   
})


///pay an order  with wallet
transactionRoute.post("/order/wallet_payment", isAuthenticatedUser, async(req,res, next) => {
    req.body.user = req.user.id;
    req.body.walletId = req.user.walletId
    const orderId = req.body.OrderId
    // const orders = await Orders.findById(orderId)

    const orders = await Orders.findById(req.body.OrderId).populate(`user`, `name email`)
    // console.log("orders list============>", orders)


    // console.log("this is the order", orders)

    // const transaction = await Transaction.create(req.body)
   if (orders && orders.paymentStatus == "Paid") {
        res.status(401).json({
           success:false,
           message:"Order Has already been paid!"
       })
   }else{
    const walletToken = await req.user.walletId
        
    if(walletToken){
        const wallet = await Wallet.find({ walletId: walletToken})
        const walletTotal = await (wallet[0].total)
        const usedPayTotal = await (wallet[0].usedPay)
        const availableTotal = await (wallet[0].Available)

            console.log(walletTotal)
            var firstPay = parseInt(usedPayTotal);

            var second = parseInt(req.body.amount);
            
        

        if(req.body.amount >= walletTotal ){
                res.status(500).json({
                success: false,
                message:"Order total is greater than your Wallet balance!. Please top up your wallet!"
                })
        }else{
            const generatedId = Math.random().toString(36).slice(-16);
            req.body.status = "successful"
            req.body.reason = "Order payment"
            req.body.paymentId = generatedId
            const newTotal = availableTotal - req.body.amount
            const payTotal = usedPayTotal + req.body.amount

            const transaction = await Transaction.create(req.body)
            const newWallet = await Wallet.updateOne({ walletId: walletToken}, {$set: {Available:newTotal, usedPay:payTotal  }}, {
                new:true,
                runValidators:true,
                useFindAndModify:false
            } )
            const transId = await transaction._id
            await Wallet.updateOne({ walletId: walletToken}, {$push: { transactionsId: transId}})
            const order_transaction = await Orders.updateOne({ _id: req.body.OrderId}, {$set: { paymentStatus: "Paid", paymentMethod:"Wallet Payment", orderStatus: "Processing"}}, {
                new:true,
                runValidators:true,
                useFindAndModify:false
            } )


            orders.orderItems.forEach(async item =>{
                await updatePaymentToShop(item.store)
        
            })

            async function updatePaymentToShop(store){

                await Shop.updateOne(
                    { "_id": store },
                    { "$set": { "ordersArray.$[elem].orderItemPaymentStatus": "Paid", "ordersArray.$[elem].orderItemStatus": "Processing" } },
                    { "arrayFilters": [{ "elem.orderId": orders._id }] }
                )

                
            }

           




            


                // Twilio.messages.create({
                //     from:"+13342476399",
                //     to: `+254${orders.shippingInfo.number}` ,
                //     body:`
                //     Hello ${orders.shippingInfo.firstname}, We have received payments for your order #${orders._id} via your Jameshop wallet . You Will receive an email once the order is Confirmed, Out for derivery and lastly When the order has been derivered . Thank you for shopping on Jameshop! Regards
            
                //     `
                // }).then((res) => console.log("message sent successfully")) 
                // .catch((err) => {console.log(err)})
        
        
                const user = await Users.findById(orders.user)
                const sendMailTo = (user.email)

                let emailContent = '<table cellspacing="0" cellpadding="8" style="border-top:1px dotted #ccc;border-bottom:1px dotted #ccc;width:100%;font-family:arial;border-collapse:collapse"><tr><th style="color:#666666;border-bottom:1px dotted #ccc;font-weight:bold;text-align:left">Item Name</th><th style="color:#666666;border-bottom:1px dotted #ccc;font-weight:bold;width:35px">Quantity</th><th style="color:#666666;border-bottom:1px dotted #ccc;font-weight:bold;width:40px;text-align:right">Price</th><th style="color:#666666;border-bottom:1px dotted #ccc;font-weight:bold;width:40px;text-align:right">Total</th></tr>';
                for (let i = 0; i < orders.orderItems.length; i++) {
                const item = orders.orderItems[i];
                emailContent += `<tr><td style="text-align:left;color:#666666">${item.name}</td><td style="text-align:left;color:#666666">${item.quantity}</td><td style="text-align:left;color:#666666">Kshs ${item.price}</td><td style="text-align:left;color:#666666">Kshs ${item.total}</td></tr>`;
                }
                emailContent += '</table>';
        
                // /email sending

                // if (!req.user.emailSettings.orderEmails) {
                // console.log("emails not allowed by user")
                
                // }
                // else{

                    sendEmail({
                        to:sendMailTo,
                        subject:`Payments for  order #${orders._id}`,
                        text:`Hello ${orders.shippingInfo.firstname}, We have received your payments for  order #${orders._id}!`,
                        html:`   
                        <table cellspacing="0" cellpadding="0" style="padding:30px 10px;background:#eee;width:100%;font-family:arial">
                        <tbody>
                        <tr>
                            <td>
                            <table align="center" cellspacing="0" style="max-width:650px;min-width:320px">
                            <tbody>
                                
                                <tr>
                                <td align="center" style="background:#fff;border:1px solid #e4e4e4;padding:50px 30px">
                                <table align="center">
                                <tbody>
                                <tr>
                                    <td style="color:#666666;text-align:center;padding-bottom:30px;font-family:arial">
                                    <span style="text-transform:uppercase"><table align="center" style="margin:auto">
                                    <tbody>
                                            <tr>
                                                <td style="text-align:center;padding-bottom:5px">
                                                    <img align="center" alt="Upsell offer accepted" src="https://ci5.googleusercontent.com/proxy/EzTErfLQ6vBLH6zTJW9Wd8sYEDQVoLh5GuKSvEF4HXE62pssHHtg-HGpOv2oQ-3X44UsgZX1swZ3ba4sGRDrTUUqo_p0gD1bIr0ugLcalJWWuZZuD5KEYdqMmvZq4cQ86etrDKf-0GRd-F9r3NyvhgOoycTgn8Uo3_fEwA=s0-d-e1-ft#https://fiverr-res.cloudinary.com/q_auto,f_auto/v1/general_assets/system_emails/upsell-offer-accepted.png" class="CToWUd" data-bit="iit">
                                                </td>
                                            </tr>

                                        <tr>
                                            <td style="color:#44ab00;font-size:16px;font-weight:bold;text-align:center;font-family:arial">

                                                Great news: Payment for order #${orders.OrderId}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                                </span>

                                <table align="center" style="margin:auto">
                                    <tbody>
                                    <tr>
                                    <td style="color:#666666;font-size:16px;padding-bottom:30px;text-align:center;font-family:arial">
                                    We have received payments for your order #${orders.OrderId} via your Jameshop wallet . You Will receive an email once the order is Confirmed, Out for derivery and lastly When the order has been derivered . Thank you for shopping on Bei Fity!
                                    </td>
                                    </tr>
                                    </tbody>
                                </table>

                                </td>
                                </tr>
                                <tr>
                                    <td style="color:#666666;padding:15px">

                                    ${emailContent}

                                    <div style="text-align:right;padding:15px 8px 30px 0px;color:#666666;font-weight:bold;font-size:16px;font-family:arial">
                                        Total Paid: Kshs ${orders.totalPrice}
                                    </div>


                                    <div style="color:#aaaaaa;padding-bottom:15px;font-size:12px;line-height:17px;font-family:arial">
                                        
                                    </div>



                                            <div style="padding-top:10px;text-align:center;font-family:arial">
                                                <img alt="Thanks" src="https://ci3.googleusercontent.com/proxy/E7RlYay6X9Fty7PBaixGrw6mrezIS6Fzn2a9fTH_H2M7MSM7N0D9QbBuq_lO7JuCzXAubejq7UXy2sGSJybtj8dDuw6FvYfTt3JHAfDw8ij0tGGfb639CkHKR0N9MxibbXmQaOpd2GmT0hdl-g=s0-d-e1-ft#https://fiverr-res.cloudinary.com/q_auto,f_auto/v1/general_assets/system_emails/thanks.png" class="CToWUd" data-bit="iit">
                                                <br>
                                                Bei Fity Team
                                            </div>
                                        </td>
                                    </tr>
                                    </tbody>
                                    </table>

                                        </td>
                                    </tr>

                                    
                                                

                                            </tbody>
                                        </table>
                                    </td>
                                </tr>

                                <tr>
                                    <td>
                                        <table align="center" style="max-width:650px">

                                            <tbody><tr>
                                                <td style="color:#b4b4b4;font-size:11px;padding-top:10px;line-height:15px;font-family:arial">
                                                    This email was intended for ${orders.shippingInfo.firstname} ${orders.shippingInfo.secondname}, because you signed up for Bei Fity | <span style="font-family:arial,helvetica neue,helvetica,sans-serif">
                                                    
                                                    © Bei Fity International Limited 2010-2023, Bei Fity Inc.
                                                </span>
                                                </td>

                                            </tr>
                                        </tbody></table>
                                    </td>
                                </tr>
                            </tbody>
                        </table>    
                        
                        
                        `
                    })
         
                // }

                await AdminNotification.create({
                    OrderId:transaction._id,
                    title:"Order Payment",
                    message:`New payment  ${transaction._id} was succesful for Order ${orders._id}.`
                })

            
                res.status(200).json({
                success: true,
                transaction,
                message:"Order was paid successfull"
                })
    
        }
    }else{
        res.status(500).json({
            success:false,
            message:"Order payment  creation failed"
        })
    }
    }
   })

 ///  ////delete order
 transactionRoute.delete("/transaction/:id", authorizeRoles('admin', "seller", "superadmin"), async(req,res, next) => {
    let transactions = await Transaction.findById(req.params.id)
    if(!transactions) {
        res.status(500).json({
            success: false,
            message:"Transactions not found!"
        })
    }
    await transactions.remove();
    res.status(200).json({
        success: true,
        message:"Transactions deleted successfully",
    })   
   })



 





export default transactionRoute;