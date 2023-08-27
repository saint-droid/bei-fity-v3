import express  from "express";
import Products from "../models/product.js";
import ErrorHandler from "../utilis/errorHandler.js"
import APIFeatures from "../utilis/APIfeatures.js"
import * as roles   from "../middlewares/auth.js";
import Orders from "../models/order.js";
import Wallet from "../models/Wallet.js";
import Transaction from "../models/Transactions.js";
import Message from "../models/messages.js";
import twilio  from "twilio";
const Twilio = new twilio('AC410e8d6e1fb0c0f0a5158357f179bc38',  "25f3c0a54cbb0cb5d1859f48884f9e26");
import nodemailer  from "nodemailer";
import Users from "../models/user.js";
import mongoose from "mongoose";
import AdminNotification from "../models/AdminNotifications.js";
import { createObjectCsvWriter } from 'csv-writer';
// import { write as xlsxWrite } from 'xlsx';
import * as xlsx from 'xlsx';
import { format } from 'date-fns';
import ExcelJS from 'exceljs';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import Shop from "../models/Shop.js";
import sendEmail from "../utilis/SendEmail.js";



const orderRoute = express.Router()
// var sid = "AC410e8d6e1fb0c0f0a5158357f179bc38"
// var auth = "25f3c0a54cbb0cb5d1859f48884f9e26"

const isAuthenticatedUser = roles.isAuthenticatedUser
const authorizeRoles = roles.authorizeRoles



///create new order
orderRoute.post("/order", isAuthenticatedUser,  async(req,res, next) => {
    
    const uuid = Math.random().toString(36).slice(-6);
    const orders = await Orders.find( { OrderId: { $in:  uuid } } )
    
    if(orders){
    const uuid = Math.random().toString(36).slice(-6);
    const {
        shippingInfo, 
        orderItems,
        paymentInfo,
        itemsPrice,
        deriveryFee,
        totalPrice,
        deriverySchedule,
        orderStatus,
        
    } = req.body;
    try {
        const orders = await Orders.create({
            shippingInfo, 
            orderItems,
            paymentInfo,
            itemsPrice,
            deriveryFee,
            totalPrice,
            orderStatus,
            deriverySchedule,
            OrderId:uuid,
            paidAt:Date.now(),
            user:req.user.id
         })

         async function updateOrderForUser(id, quantity, store, name, price, total, image){
            // console.log("this is the  Id===>", id)
    
            const stores = await Shop.findById(store)
            // console.log("stores====>", stores)
            // const storeOrderCount = stores.ordersArray && stores.ordersArray.length


            // console.log("this is the storeOrderCount===>", storeOrderCount)
            if (stores) {
                stores.orderListing = orders._id;
                stores.ordersArray = {
                    orderId: orders._id,
                    orderItemName: name,
                    orderItemPrice: price,
                    orderItemTotal: total,
                    orderItemImage:image
                }
                
                await stores.updateOne({$push: { orderListing: orders._id, 
                    ordersArray: {
                        orderId: orders._id,
                        orderItemName: name,
                        orderItemPrice: price,
                        orderItemTotal: total,
                        orderItemImage:image,
                        orderItemStatus:orders.orderStatus,
                        orderItemPaymentStatus:orders.paymentStatus,
                        orderItemCreatedDate:orders.createdAt
                    }, 
                }});

                
              


                
            }
            
        }
    
        orders.orderItems.forEach(async item =>{
            await updateOrderForUser(item.id, item.quantity, item.store, item.name, item.price, item.total, item.image)

        })


         res.status(200).json({
            success: true,
            orders,
            message:"order created successfully"
        })

        // Twilio.messages.create({
        //     from:"+13342476399",
        //     to: `+254${orders.shippingInfo.number}` ,
        //     body:`
        //     Hello ${orders.shippingInfo.firstname}, We have received your order #${orders._id}. Please pay Kshs ${orders.totalPrice} via your Jameshop wallet or Using the preffered payment method and kindly do not delete this message . You will need the details to pay for the order. Thank you for shopping on Jameshop!
    
        //     `
        // }).then((res) => console.log("message sent successfully")) 
        // .catch((err) => {console.log(err)})

        // Create an HTML table from the orderItems array
        let emailContent = '<table cellspacing="0" cellpadding="8" style="border-top:1px dotted #ccc;border-bottom:1px dotted #ccc;width:100%;font-family:arial;border-collapse:collapse"><tr><th style="color:#666666;border-bottom:1px dotted #ccc;font-weight:bold;text-align:left">Item Name</th><th style="color:#666666;border-bottom:1px dotted #ccc;font-weight:bold;width:35px">Quantity</th><th style="color:#666666;border-bottom:1px dotted #ccc;font-weight:bold;width:40px;text-align:right">Price</th><th style="color:#666666;border-bottom:1px dotted #ccc;font-weight:bold;width:40px;text-align:right">Total</th></tr>';
        for (let i = 0; i < orders.orderItems.length; i++) {
        const item = orders.orderItems[i];
        emailContent += `<tr><td style="text-align:left;color:#666666">${item.name}</td><td style="text-align:left;color:#666666">${item.quantity}</td><td style="text-align:left;color:#666666">Kshs ${item.price}</td><td style="text-align:left;color:#666666">Kshs ${item.total}</td></tr>`;
        }
        emailContent += '</table>';

        const user = await Users.findById(orders.user)
        const sendMailTo = (user.email)

         // /email semding
        if (!req.user.emailSettings.orderEmails) {
        console.log("emails not allowed by user")
        
        }
         else{

            sendEmail({
                to:sendMailTo,
                subject:`We have received your order #${orders._id}`,
                text:`Hello ${orders.shippingInfo.firstname}, We have received your order #${orders._id}!`,
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

                                                        Great news: Your order has been Received
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                        </span>

                                        <table align="center" style="margin:auto">
                                            <tbody>
                                            <tr>
                                            <td style="color:#666666;font-size:16px;padding-bottom:30px;text-align:center;font-family:arial">
                                                We have received your  order <span >#${orders._id}</span>
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
                                                Total: Kshs ${orders.totalPrice}
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
                                                            This email was intended for ${orders.shippingInfo.firstname}, because you signed up for Bei Fity | <span style="font-family:arial,helvetica neue,helvetica,sans-serif">
                                                            
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
            
        }

        //send mail to admin

        sendEmail({
            to:sendMailTo,
            subject:`New order  #${orders._id}`,
            text:`Hello, New order ${orders._id}`,
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

                                    Great news: New order #${orders._id}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    </span>

                    </td>
                    </tr>
                    <tr>
                        <td style="color:#666666;padding:15px">

                        ${emailContent}

                        <div style="text-align:right;padding:15px 8px 30px 0px;color:#666666;font-weight:bold;font-size:16px;font-family:arial">
                            Total: Kshs ${orders.totalPrice}
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


        const adminMessage = await AdminNotification.create({
            OrderId:orders._id,
            title:"New Order",
            message:`Order ${orders._id} has been placed  and is expected to be delivered between ${new Date(new Date().getTime()+(2*24*60*60*1000)) } and ${new Date(new Date().getTime()+(3*24*60*60*1000)) }`
        })

        
    } catch (error) {
        res.status(500).json({
            success: false,
            error,
            message:"order not created successfully"
        })
        
    }
    }else{

    
    const {
        shippingInfo, 
        orderItems,
        paymentInfo,
        itemsPrice,
        deriveryFee,
        totalPrice,
        orderStatus,
        
    } = req.body;
    try {
        const orders = await Orders.create({
            shippingInfo, 
            orderItems,
            paymentInfo,
            itemsPrice,
            deriveryFee,
            totalPrice,
            orderStatus,
            OrderId:uuid,
            paidAt:Date.now(),
            user:req.user.id
         })

         
        //  Twilio.messages.create({
        //     from:"+13342476399",
        //     to: `+254${orders.shippingInfo.number}` ,
        //     body:`
        //     Hello ${orders.shippingInfo.firstname}, We have received your order #${orders._id}. Please pay Kshs ${orders.totalPrice} via your Jameshop wallet or Using the preffered payment method and kindly do not delete this message . You will need the details to pay for the order. Thank you for shopping on Jameshop!
    
        //     `
        // }).then((res) => console.log("message sent successfully")) 
        // .catch((err) => {console.log(err)})

        const adminMessage = await AdminNotification.create({
            OrderId:orders._id,
            title:"New Order",
            message:`Order ${orders._id} has been placed  and is expected to be delivered between ${new Date(new Date().getTime()+(2*24*60*60*1000)) } and ${new Date(new Date().getTime()+(3*24*60*60*1000)) }`
            })


        const user = await Users.findById(orders.user)
        const sendMailTo = (user.email)

         // /email semding


         if (!req.user.emailSettings.orderEmails) {
            console.log("emails not allowed by user")
            
         }
         else{

            sendEmail({
                to:sendMailTo,
                subject:`We have received your order #${orders._id}`,
                text:`Hello ${orders.shippingInfo.firstname}, We have received your order #${orders._id}!`,
                html:`<table cellspacing="0" cellpadding="0" style="padding:30px 10px;background:#eee;width:100%;font-family:arial">
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
                                <span style="text-transform:uppercase">
                                  <table align="center" style="margin:auto">
                                    <tbody>
                                            <tr>
                                                <td style="text-align:center;padding-bottom:5px">
                                                    <img align="center" alt="Upsell offer accepted" src="https://ci5.googleusercontent.com/proxy/EzTErfLQ6vBLH6zTJW9Wd8sYEDQVoLh5GuKSvEF4HXE62pssHHtg-HGpOv2oQ-3X44UsgZX1swZ3ba4sGRDrTUUqo_p0gD1bIr0ugLcalJWWuZZuD5KEYdqMmvZq4cQ86etrDKf-0GRd-F9r3NyvhgOoycTgn8Uo3_fEwA=s0-d-e1-ft#https://fiverr-res.cloudinary.com/q_auto,f_auto/v1/general_assets/system_emails/upsell-offer-accepted.png" class="CToWUd" data-bit="iit">
                                                </td>
                                            </tr>
            
                                        <tr>
                                            <td style="color:#44ab00;font-size:16px;font-weight:bold;text-align:center;font-family:arial">
                                            We have received your order #${orders._id}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                                </span>
            
                              </td>
                              </tr>
                              <tr>
                                <td style="color:#666666;padding:15px">
                                  <div style="text-align:right;padding:15px 8px 30px 0px;color:#666666;font-weight:bold;font-size:16px;font-family:arial">
                                    <div style="padding:10px; line-height:22px; -moz-border-radius: 5px;-webkit-border-radius: 5px;	border-radius: 5px; color:#003366;      
                                    background:#e6efee; border:1px solid #c4de95; font-family: Corbel; font-size:14px;">
                                    Hello <strong> ${orders.shippingInfo.firstname},</strong><br/>
                                    We have received your order #${orders._id}. Please pay Kshs ${orders.totalPrice} via your Jameshop wallet or Using the preffered payment method and kindly do not delete this message . You will need the details to pay for the order. Thank you for shopping on Jameshop!
                                    </div>
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
                                    This email was intended for Admin James Nthiga, because you signed up for Bei Fity | <span style="font-family:arial,helvetica neue,helvetica,sans-serif">
                                    
                                    © Bei Fity International Limited 2010-2023, Bei Fity Inc.
                                </span>
                                </td>
            
                            </tr>
                        </tbody></table>
                    </td>
                </tr>
                </tbody>
              </table>`
            })

         }



         res.status(200).json({
            success: true,
            adminMessage,
            orders,
            message:"order created successfully"
        })
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error,
            message:"order not created successfully"
        })
        
    }
    }
   
})




///get single order
orderRoute.get("/order/:id", isAuthenticatedUser,  async(req,res, next) => {
    // const OrderId = req.params.id
    try {
        // const { ObjectId } = require('mongodb');

        
        // const order = await Orders.aggregate([
        //     { $match: { _id: mongoose.Types.ObjectId(req.params.id)} },
        //     {
        //     $lookup:
        //         {
        //             from: 'users',
        //             localField: 'user',
        //             foreignField: '_id',
        //             as: 'user'
        //         },
        //     }
        // ])
        const order = await Orders.findById(req.params.id).populate(`user`, `name email`)

        
        res.status(200).json({
          success: true,
          order,
          message: 'Order found successfully'
        });


            
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error,
            message:"order not Found"
        })
    }
  

    
})

///get logged in user  orders
orderRoute.get("/user/orders", isAuthenticatedUser,  async(req,res, next) => {
    // const order = await Orders.find({user: req.user.id})

    const order = await Orders.aggregate([
        { $sort: { createdAt: -1 } },
        { $match: {'user':  mongoose.Types.ObjectId(req.user.id)}},
        
        
    ]);
 
    if (!order) {
     res.status(500).json({
         success: false,
         message:"orders not Found"
     })
    }
    res.status(200).json({
     success: true,
     order,
     message:"orders found successfully"
 })
 
    
 })


 orderRoute.get('/earning/:timePeriod', async (req, res) => {
    try {
      const timePeriod = req.params.timePeriod.toLowerCase();
      let startDate, endDate;
  
      // Determine the start and end date based on the time period requested
      switch (timePeriod) {
        case 'monthly':
          startDate = new Date();
          startDate.setMonth(startDate.getMonth() - 1);
          endDate = new Date();
          break;
        case 'weekly':
          startDate = new Date();
          startDate.setDate(startDate.getDate() - 7);
          endDate = new Date();
          break;
        case 'yearly':
          startDate = new Date();
          startDate.setFullYear(startDate.getFullYear() - 1);
          endDate = new Date();
          break;
        case 'alltime':
          startDate = new Date(0);
          endDate = new Date();
          break;
        default:
          return res.status(400).json({ message: 'Invalid time period' });
      }
  
      // Query the database for orders within the specified time period
    //   const ordersListing = await Orders.find({ createdAt: { $gte: startDate, $lte: endDate } });
    
       // Query the database for orders within the specified time period
    const ordersListing = await Orders.find({ createdAt: { $gte: startDate, $lte: endDate } });

    // Calculate the total earnings and number of orders from the orders
    const totalEarnings = ordersListing.reduce((acc, order) => acc + order.totalPrice, 0);
    const numOrders = ordersListing.length;

   
     // Create an Excel workbook
     const workbook = new ExcelJS.Workbook();
     const worksheet = workbook.addWorksheet('Orders');
 
     // Define the headers for the worksheet
     worksheet.columns = [
       { header: 'Order ID', key: 'orderId', width: 15 },
       { header: 'Customer Name', key: 'customerName', width: 20 },
       { header: 'Total Price', key: 'totalPrice', width: 15 },
       { header: 'Created At', key: 'createdAt', width: 20 },
     ];
 
     // Add the orders to the worksheet
     ordersListing.forEach((order) => {
       worksheet.addRow({
         orderId: order._id,
         customerName: order.customerName,
         totalPrice: order.totalPrice,
         createdAt: order.createdAt.toISOString(),
       });
     });
 
     // Generate a download link for the Excel file
     const downloadLink = `/${timePeriod}_orders_${new Date().toISOString()}.xlsx`;
 
    //  // Save the Excel file to the server
    //  const directoryPath = path.join(__dirname, '..', 'public');
    //  await fs.mkdir(directoryPath, { recursive: true });
 
    //  // Define the Python script path
    //  const pythonScriptPath = path.join(__dirname, 'excel_converter.py');
 
    //  // Execute the Python script as a child process
    //  const pythonProcess = spawn('python', [pythonScriptPath, downloadLink], { cwd: directoryPath });
    //  pythonProcess.on('error', (err) => {
    //    console.error(err);
    //    res.status(500).json({ message: 'Server error' });
    //  });
    //  pythonProcess.on('exit', (code) => {
    //    if (code !== 0) {
    //      console.error(`Python script exited with code ${code}`);
    //      res.status(500).json({ message: 'Server error' });
    //    } else {
    //      const filePath = path.join(directoryPath, downloadLink.replace(':', ''));
    //      res.json({ downloadLink });
    //    }
    //  });
   

  
      res.json({ totalEarnings, numOrders, ordersListing, downloadLink });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  });

 ///get all orders

 orderRoute.get("/all/orders", isAuthenticatedUser, authorizeRoles('admin', "superadmin"),  async(req,res, next) => {
    const orderCompleted = await Orders.find( {orderStatus: "Package delivered" } )
    console.log("this is completed", orderCompleted)

    const orders = await Orders.aggregate([
        { $sort: { createdAt: -1 } },

        {
            $lookup:
            {
                from: 'users',
                localField: 'user',
                foreignField: '_id',
                as: 'user'
            },
        }
    ])

    const date = new Date();
    console.log("date====>", date)


    // the start of the day (midnight)

    const todaysOrders = await Orders.countDocuments({
        "createdAt": { "$gte": new Date(new Date().getTime()-(24*60*60*1000))  },
     }
        
     )


     const yesterdayOrders = await Orders.countDocuments({
        "createdAt": { "$gte": new Date(new Date().getTime()-(2*24*60*60*1000)), "$lte": new Date(new Date().getTime()-(24*60*60*1000)),   },

     }
        
     )


    // const todaysOrders = await Orders.countDocuments({createdAt:  })



    
    if (!orders) {
     res.status(500).json({
         success: false,
         message:"orders not Found"
     })
    }
    const orderLength = await Orders.countDocuments()
    let totalAmount = 0;
    orders.forEach(order => {
        totalAmount += order.totalPrice
    } )

    let sellProduct = 0;
    orders.forEach(order => {
        sellProduct += order.orderItems.length
    } )


    const orderSummary = await Orders.aggregate([
        {
        $project: {
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" },
            totalPrice: 1
        }
        },
        {
        $group: {
            _id: {
            month: "$month",
            year: "$year"
            },
            orders: { $sum: 1 },
            totalEarned: { $sum: "$totalPrice" }
        }
        },
        {
            $sort: {
              "_id.year": -1,
              "_id.month": -1,
            },
          },
      ]);
      

   


    res.status(200).json({
        success: true,
        orderLength,
        totalAmount,
        orderSummary: orderSummary,
        todaysOrders,
        yesterdayOrders,
        sellProduct,
        completedOrder:orderCompleted.length,
        orders,
        message:"orders found successfully"
    })
 
    
 })
 ///update & edit orders

 orderRoute.put("/admin/orders/:id", isAuthenticatedUser, authorizeRoles('admin', "superadmin"),  async(req,res, next) => {
    try {
    const orders = await Orders.findById(req.params.id)

    async function updateStock(id, quantity){
        console.log("this is the  Id===>", id)

        const products = await Products.findById(id)
        console.log("this is the product===>", products)
        if (products) {
            products.stock = products.stock - quantity;
            await products.save({validateBeforeSave: false});
            
        }
        
    }
    
    if(req.body.orderStatus === "Confirmed"){
        
    orders.orderItems.forEach(async item =>{
        await updateStock(item.id, item.quantity)

    })

    orders.orderItems.forEach(async item =>{
        await updatePaymentToShop(item.store)

    })

    async function updatePaymentToShop(store){

        await Shop.updateOne(
            { "_id": store },
            { "$set": { "ordersArray.$[elem].orderItemStatus": "Confirmed" } },
            { "arrayFilters": [{ "elem.orderId": orders._id }] }
        )

        
    }

    
    }

    const user = await Users.findById(orders.user)
    const sendMailTo = (user.email)
    await Orders.updateOne({ _id: req.params.id}, {$set: {orderStatus: req.body.orderStatus}}, {
        new:true,
        runValidators:true,
        useFindAndModify:false
    } )


    orders.orderStatus = req.body.orderStatus,
    orders.deriveredAt = Date.now()

    if (!orders) {
     res.status(500).json({
         success: false,
         message:"orders not Found"
     })
    }
    if (orders.orderStatus  === 'Delivered') {
        res.status(401).json({
            success: false,
            message:"order has already been derivered "
        })  
    }

    if(req.body.orderStatus === "Confirmed" ){
   
            const message = await Message.create({
            OrderId:req.params.id,
            title:"Confirmed",
            userId:orders.user,
            message:`Hello ${orders.shippingInfo.firstname},  Your order #${req.params.id} has been confirmed and is expected to be delivered between ${new Date(new Date().getTime()+(2*24*60*60*1000)) } and ${new Date(new Date().getTime()+(3*24*60*60*1000)) } To track status of your order you can go to Orders on Account menu. We will let you know when the item is shipped. Thank you for shopping on Jameshop!`
            })

            const adminMessage = await AdminNotification.create({
                OrderId:req.params.id,
                title:"Confirmed",
                message:`Order #${req.params.id} has been confirmed and is expected to be delivered between ${new Date(new Date().getTime()+(2*24*60*60*1000)) } and ${new Date(new Date().getTime()+(3*24*60*60*1000)) } `
            })

            orders.orderItems.forEach(async item =>{
                await updatePaymentToShop(item.store)
        
            })
        
            async function updatePaymentToShop(store){
        
                await Shop.updateOne(
                    { "_id": store },
                    { "$set": { "ordersArray.$[elem].orderItemStatus": "Confirmed" } },
                    { "arrayFilters": [{ "elem.orderId": orders._id }] }
                )
        
                
            }



            ///messages 
            // Twilio.messages.create({
            //     from:"+13342476399", 
            //     to:`+254${orders.shippingInfo.number}`,
            //     body:`Hello ${orders.shippingInfo.firstname}, Your order #${req.params.id} has been confirmed and is expected to be delivered between ${new Date(new Date().getTime()+(2)) } and ${new Date(new Date().getTime()+(3*24*60*60*1000)) }  To track status of your order you can go to Orders on Account menu. We will let you know when the item is shipped. Thank you for shopping on Jameshop!`
            // }).then((res) => console.log("message sent successfully")) 
            // .catch((err) => {console.log(err)})

            // /email semding

            let transporter  = nodemailer.createTransport({
                service:"gmail",
                auth:{
                    user:"lessin915@gmail.com",
                    pass:process.env.SMTP_PASSWORD,
                },
                tls:{
                    rejectUnauthorized:false
                }
            })
            let mailOptions = {
                from:"lessin915@gmail.com",
                to:sendMailTo,
                Bcc:'lessin915@gmail.com',
                subject:`Your  Order #${req.params.id} has been Confirmed`,
                text:`
                Hello ${orders.shippingInfo.firstname}, Your order #${req.params.id} has been confirmed!
                `,
                html:`
                
                <html>
                <body>
                <div style="padding:10px; line-height:22px; -moz-border-radius: 5px;-webkit-border-radius: 5px;	border-radius: 5px; color:#003366;      
                background:#e6efee; border:1px solid #c4de95; font-family: Corbel; font-size:14px;">Hello <strong> ${orders.shippingInfo.firstname},</strong><br/>
                Your order #${req.params.id} has been confirmed and is expected to be delivered between 
                ${new Date(new Date().getTime()+(3*24*60*60*1000)) } and ${new Date(new Date().getTime()+(3*24*60*60*1000)) }  To track status of your order you can go to Orders on Account menu. We will let you know when the item is shipped. Thank you for shopping on Jameshop!
        

                <br/><br/>
                <span style="color:#253350; font-weight:bold; font-size:15px;">
                Regards,<br>
                The Support Department, <br/>Jameshop<br/>
                <strong><i></i></strong><br>
                </span>
                </div>

                </body>
                </html>

                
                
                `

            }

            transporter.sendMail(mailOptions,function(err,result){
                if(err) {
                    console.log(err)
                }
                else{
                    console.log("email sent successfully")

                }
            })




    }
    if(req.body.orderStatus === "Out for delivery" ){
        await Orders.updateOne({ _id: req.params.id}, {$set: {orderStatus: "Out for delivery"}}, {
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
                { "$set": { "ordersArray.$[elem].orderItemStatus": "Out for delivery" } },
                { "arrayFilters": [{ "elem.orderId": orders._id }] }
            )

            
        }
        const message = await Message.create({
            OrderId:req.params.id,
            title:"Out for delivery",
            userId:orders.user,
            message:`Hello ${orders.shippingInfo.firstname}, Your package is out for delivery and we will soon call you to plan the delivery of your package# ${req.params.id}. If you have any questions about this delivery, please contact your delivery agent (tel. 0759643215). Please remember to have the amount of ${orders.totalPrice} KES ready to receive your package. You can also choose to pay with Jameshop Pay on delivery (if available). Thank you for shopping on Jameshop!`
        })
        await AdminNotification.create({
                OrderId:req.params.id,
                title:"Order Marked for delivery",
                message:`Order ${req.params.id} is out for delivery .`
        })

            Twilio.messages.create({
                from:"+13342476399", 
                to:`+254${orders.shippingInfo.number}`,
                body:`Hello ${orders.shippingInfo.firstname}, Your package is out for delivery and we will soon call you to plan the delivery of your package# ${req.params.id}. If you have any questions about this delivery, please contact your delivery agent (tel. 0759643215). Please remember to have the amount of ${orders.totalPrice} KES ready to receive your package. You can also choose to pay with Jameshop Pay on delivery (if available). Thank you for shopping on Jameshop!`
            }).then((res) => console.log("message sent successfully")) 
            .catch((err) => {console.log(err)})

            // /email semding


            if (!req.user.emailSettings.orderEmails) {
            console.log("emails not allowed by user")
            
            }
            else{
                let transporter  = nodemailer.createTransport({
                    service:"gmail",
                    auth:{
                        user:"lessin915@gmail.com",
                        pass:"sztxtosgyixaavxi"
                    },
                    tls:{
                        rejectUnauthorized:false
                    }
                })
                let mailOptions = {
                    from:"lessin915@gmail.com",
                    to:sendMailTo,
                    subject:`Your  Order #${req.params.id} is out for delivery`,
                    text:`
                    Hello ${orders.shippingInfo.firstname}, Your order #${req.params.id} is out for delivery!
                    `,
                    html:`
                    
                    <html>
                    <body>
                    <div style="padding:10px; line-height:22px; -moz-border-radius: 5px;-webkit-border-radius: 5px;	border-radius: 5px; color:#003366;      
                    background:#e6efee; border:1px solid #c4de95; font-family: Corbel; font-size:14px;">Hello <strong> ${orders.shippingInfo.firstname},</strong><br/>
                    Your package is out for delivery and we will soon call you to plan the delivery of your package# ${req.params.id}. If you have any questions about this delivery, please contact your delivery agent (tel. 0759643215). Please remember to have the amount of ${orders.totalPrice} KES ready to receive your package. You can also choose to pay with Jameshop Pay on delivery (if available). Thank you for shopping on Jameshop!
            

                    <br/><br/>
                    <span style="color:#253350; font-weight:bold; font-size:15px;">
                    Regards,<br>
                    The Support Department, <br/>Jameshop<br/>
                    <strong><i></i></strong><br>
                    </span>
                    </div>

                    </body>
                    </html>

                    
                    
                    `

                }

                transporter.sendMail(mailOptions,function(err,result){
                    if(err) {
                        console.log(err)
                    }
                    else{
                        console.log("email sent successfully")

                    }
                })
            }
    }
    if(req.body.orderStatus === "Package delivered" ){
        await Orders.updateOne({ _id: req.params.id}, {$set: {orderStatus: "Package delivered"}}, {
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
                { "$set": { "ordersArray.$[elem].orderItemStatus": "Package delivered",  "ordersArray.$[elem].orderItemDeriveredDate": new Date() } },
                { "arrayFilters": [{ "elem.orderId": orders._id }] }
            )

            
        }

        await AdminNotification.create({
            OrderId:req.params.id,
            title:"Order Delivered",
            message:`Order  ${req.params.id} Was successfully delivered.`
        })
        const message = await Message.create({
            OrderId:req.params.id,
            title:"Package delivered",
            userId:orders.user,
            message:`Hello ${orders.shippingInfo.firstname}, your  Package# ${req.params.id} Was successfully delivered. If you have any questions or comments on your product, use the Helpcentre to find a solution. Thank you for shopping on Jameshop!`
            })

            
            Twilio.messages.create({
                from:"+13342476399", 
                to:`+254${orders.shippingInfo.number}`,
                body:`Hello ${orders.shippingInfo.firstname}, your  Package# ${req.params.id} Was successfully delivered. If you have any questions or comments on your product, use the Helpcentre to find a solution. Thank you for shopping on Jameshop!`
            }).then((res) => console.log("message sent successfully")) 
            .catch((err) => {console.log(err)})

            // /email semding

            if (!req.user.emailSettings.orderEmails) {
             console.log("emails not allowed by user")
            
            }
            else{

                let transporter  = nodemailer.createTransport({
                    service:"gmail",
                    auth:{
                        user:"lessin915@gmail.com",
                        pass:"sztxtosgyixaavxi"
                    },
                    tls:{
                        rejectUnauthorized:false
                    }
                })
                let mailOptions = {
                    from:"lessin915@gmail.com",
                    to:sendMailTo,
                    subject:`Your  Package# ${req.params.id} Was  successfully delivered`,
                    text:`
                    Hello ${orders.shippingInfo.firstname}, Your Package# ${req.params.id} Was  successfully delivered!
                    `,
                    html:`
                    
                    <html>
                    <body>
                    <div style="padding:10px; line-height:22px; -moz-border-radius: 5px;-webkit-border-radius: 5px;	border-radius: 5px; color:#003366;      
                    background:#e6efee; border:1px solid #c4de95; font-family: Corbel; font-size:14px;">Hello <strong> ${orders.shippingInfo.firstname},</strong><br/>
                    Your  Package# ${req.params.id} Was successfully delivered. If you have any questions or comments on your product, use the Helpcentre to find a solution. Thank you for shopping on Jameshop!
            

                    <br/><br/>
                    <span style="color:#253350; font-weight:bold; font-size:15px;">
                    Regards,<br>
                    The Support Department, <br/>Jameshop<br/>
                    <strong><i></i></strong><br>
                    </span>
                    </div>

                    </body>
                    </html>

                    
                    
                    `

                }

                transporter.sendMail(mailOptions,function(err,result){
                    if(err) {
                        console.log(err)
                    }
                    else{
                        console.log("email sent successfully")

                    }
                })
            }
    }
    
   
    
    await orders.save()
    
    res.status(200).json({
     success: true,
     orders,
     message:"orders updated successfully"
     })
  
    } catch (error) {
        res.status(200).json({
        success: false,
        error,
        message:"Order Not Updated!"
        }) 
    }
    
 })

///  ////delete order
orderRoute.delete("/order/:id", isAuthenticatedUser,authorizeRoles('admin', "seller", "superadmin"), async(req,res, next) => {
let order = await Orders.findById(req.params.id)
if(!order) {
    res.status(500).json({
        success: false,
        message:"Order not found Please contact support for help"
    })
}
await order.remove();

await AdminNotification.create({
    OrderId:req.params.id,
    title:"Order Deleted",
    message:`Order  ${req.params.id} Was successfully Deleted.`
})


res.status(200).json({
    success: true,
    message:"Order deleted successfully",
})   
})


   ///get SELLER   orders
orderRoute.get("/seller/orders", isAuthenticatedUser, authorizeRoles('admin', "seller", "superadmin"),  async(req,res, next) => {
    const userId = req.user.id
    const orders = await Orders.aggregate([
        { $sort: { createdAt: -1 } },
        { $match: {'orderItems.sellerId': userId}},
        
           
        

    ])

    let sellerOrderTotal = 0;
    orders.forEach(order => {
        sellerOrderTotal += order.itemsPrice
    } )
    

     
    



    res.status(200).json({
     orders_length: orders.length ,
     orders,
     sellerOrderTotal,
     success: true,
     message:"orders found successfully"
 })
 
    
 })

 ///update & edit orders

 orderRoute.put("/payment_confirmation_updater/:id", isAuthenticatedUser,  async(req,res, next) => {
    const orders = await Orders.findById(req.params.id)
    console.log(orders)
    
    if (!orders) {
        res.status(500).json({
            success: false,
            message:"orders not Found"
        })
       }
    
    const user = await Users.findById(orders.user)
    const sendMailTo = (user.email)
    const order__updater = await Orders.updateOne({ _id: req.params.id}, {$set: {paymentStatus: "Not paid", paymentMethod:"Stripe Checkout"}}, {
        new:true,
        runValidators:true,
        useFindAndModify:false
    } )
    console.log("order update after payment===>> ", order__updater)
   
        const message = await Message.create({
            OrderId:req.params.id,
            title:"Order payment",
            userId:orders.user,
            message:`
            Hello ${orders.shippingInfo.firstname}, We have received payments for your order #${orders._id} via Stripe checkout . You Will receive an email once the order is Confirmed, Out for derivery and lastly When the order has been derivered . Thank you for shopping on Jameshop! Regards`
            })

            const adminMessage = await AdminNotification.create({
                OrderId:req.params.id,
                title:"Order payment",
                message:`
                Order #${req.params.id} has been payed by ${user.name} user Id ${user._id} and is awaiting confirmation }  
                `
                })

            ///messages 
            // Twilio.messages.create({
            //     from:"+13342476399", 
            //     to:`+254${orders.shippingInfo.number}`,
            //     body:`
            //     Hello ${orders.shippingInfo.firstname}, We have received payments for your order ${orders._id} via Stripe checkout . You Will receive an email once the order is Confirmed, Out for derivery and lastly When the order has been derivered . Thank you for shopping on Jameshop! Regards
            //     `
            // }).then((res) => console.log("message sent successfully")) 
            // .catch((err) => {console.log(err)})

            // /email semding

            let transporter  = nodemailer.createTransport({
                service:"gmail",
                auth:{
                    user:"lessin915@gmail.com",
                    pass:"sztxtosgyixaavxi"
                },
                tls:{
                    rejectUnauthorized:false
                }
            })
            let mailOptions = {
                from:"lessin915@gmail.com",
                to:sendMailTo,
                subject:`Your  Order #${req.params.id} payment was sucessfull`,
                text:`
                Hello ${orders.shippingInfo.firstname}, Your order #${req.params.id} payment was sucessfull
                `,
                html:`
                
                <html>
                <body>
                <div style="padding:10px; line-height:22px; -moz-border-radius: 5px;-webkit-border-radius: 5px;	border-radius: 5px; color:#003366;      
                background:#e6efee; border:1px solid #c4de95; font-family: Corbel; font-size:14px;">Hello <strong> ${orders.shippingInfo.firstname},</strong><br/>
                We have received payments for your order ${orders._id} via Stripe checkout . You Will receive an email once the order is Confirmed, Out for derivery and lastly When the order has been derivered . Thank you for shopping on Jameshop! Regards
        

                <br/><br/>
                <span style="color:#253350; font-weight:bold; font-size:15px;">
                Regards,<br>
                The Support Department, <br/>Jameshop<br/>
                <strong><i></i></strong><br>
                </span>
                </div>

                </body>
                </html>

                
                
                `

            }

            transporter.sendMail(mailOptions,function(err,result){
                if(err) {
                    console.log(err)
                }
                else{
                    console.log("email sent successfully")

                }
            })




    
  
 
    // await orders.save()
    
    res.status(200).json({
     success: true,
     
     message:"orders updated successfully"
     })
   
 
    
 })


    ///get stats for graph   
orderRoute.get("/stats/dashboard", isAuthenticatedUser, authorizeRoles('admin', "seller", "superadmin"),  async(req,res, next) => {
    const userId = req.user.id
 
    try {
        const stats = await Orders.aggregate([
        // { 
        //     $match: { createdAt: { $year: '2023' } } 
        // },
        { $sort: { createdAt: -1  } },

        { 
            $group: {
                _id: { 
                    year: { $year: "$createdAt" }, 
                    month: { $month: "$createdAt" } 
                },
                total_cost_month: { $sum: "$totalPrice" },
                earning_month: { 
                    $push: { 
                        date_started: "$createdAt",
                        // day: { $dayOfWeek: "$createdAt" } ,
                        total_cost: "$totalPrice" 
                    } 
                }
            }
        },
        {
            $sort: {
              "_id.year": -1,
              "_id.month": -1,
            },
          },
        ])
        res.status(200).json({
            stats,
            success: true,
            message:"Dashboard stats found successfully"
        })
    } catch (error) {
        res.status(200).json({
            error,
            success: false,
            message:"Dashboard stats not found"
        }) 
    }
   
 
    
 })

export default orderRoute;