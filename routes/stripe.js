import express  from "express";
import Stripe from   "stripe";
const stripe = new Stripe('sk_test_51JD5IgEiLoIxMyKLBkRypsPQJ78eHTlwiG3VvW18wZXGYUx0IL7VqoCWB2f7rSMXKOEYPECCxwNJs8MUjL2OPmqx00e3yim4b3');
import { v4 as uuidv4 } from 'uuid'
import bodyParser from 'body-parser'
import Transaction from "../models/Transactions.js";
import Orders from "../models/order.js";
import * as roles   from "../middlewares/auth.js";
import Users from "../models/user.js";
import Message from "../models/messages.js";
import AdminNotification from "../models/AdminNotifications.js";
import nodemailer  from "nodemailer";
import Shop from "../models/Shop.js";

const isAuthenticatedUser = roles.isAuthenticatedUser
const authorizeRoles = roles.authorizeRoles


const stripeRoute = express.Router()



stripeRoute.post("/stripe_payments", bodyParser.urlencoded({ extended: false }), isAuthenticatedUser,   async(request,response) => {
    request.body.user = request.user.id;
    request.body.walletId = request.user.walletId
    try {
         const id = request.body.order_id
       const order = await Orders.findById(id)
       const session = await  stripe.checkout.sessions.create({
        payment_method_types:["card", "alipay"],
        mode:"payment",
        customer_email:request.user.email,
        phone_number_collection: {
            enabled: true,
        },
        metadata: {
            'order_id': request.body.order_id,
            'user_id':request.user.id,
        },
        line_items:[{
                price_data:{
                    currency:'usd', 
                    product_data:{
                        name:`Payment for order ${order.OrderId} `,
                        // order_id:`${order._id} `,
                        },
                    unit_amount:order.totalPrice * 100,
                                          
                }, 
            quantity:1,

        }],

        
        

        success_url:`https://v1jameshop.netlify.app/#/account/order/${id}`,
        cancel_url:`https://v1jameshop.netlify.app/#/account/order/${id}`,
        

        })
        await Orders.updateOne({ _id:request.body.order_id}, {$set: {payment_intent: session.payment_intent, paymentMethod:"stripe checkout payment"}}, {
            new:true,
            runValidators:true,
            useFindAndModify:false
        } )

        order.orderItems.forEach(async item =>{
            await updatePaymentToShop(item.store)
    
        })

        async function updatePaymentToShop(store){

            await Shop.updateOne(
                { "_id": store },
                { "$set": { "ordersArray.$[elem].orderItemPaymentStatus": "Paid", "ordersArray.$[elem].orderItemStatus": "Processing" } },
                { "arrayFilters": [{ "elem.orderId": order._id }] }
            )

            
        }

      
        console.log(session)

        response.status(200).json({
            success: true,
            url: session.url
        });
        
       

    } catch (e) {
        response.status(500).json({
            success: false,
            error: e.message
        });
    }


})

// This is your Stripe CLI webhook secret for testing your endpoint locally.
const endpointSecret = "whsec_xSx5wUG71V9W4sDvxr9c2Koj1u3LKCUS";

stripeRoute.post('/webhook', express.raw({type: 'application/json'}), async(request, response) => {
  const sig = request.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
  } catch (err) {
    response.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object.payment_intent;
      console.log("checkout completed for order with payment_intent  =====>", session)
      const orders = await Orders.find({payment_intent:session})
      if(orders){
        console.log("order found successfully===>", orders)
      }else{
        console.log("order not found")

      }

      await Orders.updateOne({ payment_intent:session}, {$set: { paymentStatus:"Paid"}}, {
        new:true,
        runValidators:true,
        useFindAndModify:false
      } )

    const messages = await Message.create({
    OrderId:event.data.object.metadata.order_id,
    title:"Order payment",
    userId:event.data.object.metadata.user_id,
    message:`
    Hello  ${event.data.object.customer_email}, We have received payments for your order  ${event.data.object.metadata.order_id} via Stripe checkout . You Will receive an email once the order is Confirmed, Out for derivery and lastly When the order has been derivered . Thank you for shopping on Jameshop! Regards

    `
    })
    const adminMessages = await AdminNotification.create({
    OrderId:event.data.object.metadata.order_id,
    title:"Order payment",
    message:`
    Order ${event.data.object.metadata.order_id} has been payed by ${event.data.object.customer_email}, user Id ${event.data.object.metadata.user_id}, and is awaiting confirmation 
    `
    })


     
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
        to:event.data.object.customer_email,
        Bcc:'lessin915@gmail.com',
        subject:`Your  Order ${event.data.object.metadata.order_id} payment was sucessfull`,
        text:`
        Hello, Your Order ${event.data.object.metadata.order_id} payment was sucessfull
        `,
        html:`
        
        <html>
        <body>
        <div style="padding:10px; line-height:22px; -moz-border-radius: 5px;-webkit-border-radius: 5px;	border-radius: 5px; color:#003366;      
        background:#e6efee; border:1px solid #c4de95; font-family: Corbel; font-size:14px;">Hello <strong> ${event.data.object.customer_email},</strong><br/>
        We have received payments for your order <strong>${event.data.object.metadata.order_id}</strong> via Stripe checkout . You Will receive an email once the order is Confirmed, Out for derivery and lastly When the order has been derivered . Thank you for shopping on Jameshop! Regards


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



 
      // Then define and call a function to handle the event checkout.session.completed
      break;
    // ... handle other event types
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  response.send();
});




export default stripeRoute;