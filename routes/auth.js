import express  from "express";
import Users from "../models/user.js";
import sendToken from "../utilis/jwtToken.js";
import generateToken from "../utilis/jwtToken.js";
import sendEmail from "../utilis/SendEmail.js";
import sendDeleteEmail from "../utilis/SendDeleteEmail.js";
import crypto  from "crypto";
import * as roles   from "../middlewares/auth.js";
import { v4 as uuidv4 } from 'uuid';
import cloudinary from "cloudinary"
import Wallet from "../models/Wallet.js";
import AdminNotification from "../models/AdminNotifications.js";
import nodemailer  from "nodemailer";




const authRoute = express.Router()


const isAuthenticatedUser = roles.isAuthenticatedUser
const authorizeRoles = roles.authorizeRoles
///register user

authRoute.post("/sessions/register",  async (req, res)=>{

    const walletId = uuidv4();
    req.body.walletId = walletId;
    req.body.isWalletActive = true;


    // const result = await cloudinary.v2.uploader.upload(req.body.avatar,{
    //     folder:"avatars",
    //     width:150,
    //     crop:"scale"
    // })
    const {avatar, name, email,username, password} = req.body

    
    try {
        if(!email || !avatar || !name || !username || !password){
            return res.status(400).json({
                message: "Please enter your email and password"
            })
        }
        ///finding user with match email and password
        const user = await Users.findOne({email})
        console.log(user)

        if (!user) {
            const createdUser = await Users.create(req.body)
            const sendMailTo = (createdUser.email)

            await Wallet.create({ownedBy:createdUser._id, walletId:createdUser.walletId})
            await AdminNotification.create({
                UserId:createdUser._id,
                title:"User Created",
                message:`User  ${createdUser.email} has been Created on  ${new Date(new Date().getTime()) }  }`
            })

            //send welcome email

            sendEmail({
              to:sendMailTo,
              subject:`Welcome, Your Account Was Created`,
              text:`Hello ${createdUser.name},  Your Account Was Created Successfully`,
              html:`<table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:separate">

              <tbody>
              <tr>
                            <td align="center" bgcolor="#eeeeee" class="m_3025674106711546784mobile-bg m_3025674106711546784mobile-nospace" height="20" valign="top" width="100%"></td>
                        </tr>
                <tr>
                  <td align="center" bgcolor="#eeeeee" class="m_3025674106711546784mobile-bg m_3025674106711546784no-padding" style="padding:0px 15px">
            
                  <table bgcolor="#ffffff" border="0" cellpadding="0" cellspacing="0" class="m_3025674106711546784responsive-table" style="max-width:600px;border-collapse:separate" width="100%">
                    <tbody>
                      <tr>
                        <td>
            
                        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:separate">
                          <tbody>
                          
                            
                            
                      <tr>
                        <td bgcolor="#ffffff" height="32" valign="top" width="100%"></td>
                      </tr>
                      
                                <tr>
                        <td align="left" class="m_3025674106711546784padding" style="font-size:36px;font-family:&quot;Helvetica Neue&quot;;line-height:42px;color:#333333;padding:0px 40px">
                        <span style="color:#3ebf73;font-size:40px;font-family:Georgia;line-height:40px;text-align:left"><i>Welcome</i></span><b> to <span class="il">Bei fity</span></b>
                        </td>
                        </tr>
                            
                            
                      <tr>
                        <td align="center" bgcolor="#ffffff" height="18" valign="top" width="100%"></td>
                      </tr> 
                            
                            
                            
                            <tr>
                              <td class="m_3025674106711546784padding" style="font-size:16px;font-family:Helvetica;line-height:26px;color:#404145;padding:0px 40px">
                              With one click, you’ve opened the door to the world’s most affordable marketplace.
                              <br><br>
                              Finally, there’s a lifetime of opportunities in one place. All those products and services you have planned or on hold? Just one click away. No need to prioritize, postpone, or procrastinate – thousands of professional sellers are ready to provide you with your idea products/services. It’s time to start seeing those “to-buy” product “done”.
                              </td>
                            </tr>
                      
                      <tr>
                        <td align="center" bgcolor="#ffffff" height="40" valign="top" width="100%"></td>
                      </tr>
                            <tr>
                              <td align="center" class="m_3025674106711546784padding" style="font-size:16px;font-family:Helvetica;line-height:26px;color:#404145;padding:0px 40px">Welcome to the future of professional sellers.
                              </td>
                            </tr>
                      
                      <tr>
                        <td align="center" bgcolor="#ffffff" height="16" valign="top" width="100%"></td>
                      </tr>
        
                      <tr>
                        <td align="center" bgcolor="#ffffff" height="48" valign="top" width="100%"></td>
                      </tr>
                    </tbody>
            </table>
                  
                      </td>
            </tr>
                   
            <tr>
                  <td align="center" bgcolor="#eeeeee" style="padding:20px 0px">
            
                  <table align="center" border="0" cellpadding="0" cellspacing="0" class="m_3025674106711546784responsive-table" style="max-width:600px;border-collapse:separate" width="100%">
                    <tbody>
                      <tr>
                        <td align="center" style="color:#818181;font-size:12px;padding-top:5px;line-height:1.5;font-family:'Helvetica Light','Helvetica',Arial,sans-serif">
            
              </td>
            </tr>
            <tr>
                  <td style="color:#c5c6c9;font-size:12px;line-height:18px;font-family:arial,helvetica neue,helvetica,sans-serif;padding:0px 5px" align="center"><span style="font-size:12px"><span style="font-family:arial,helvetica neue,helvetica,sans-serif">
                    
                  <span style="color:#7a7d85">
                  This email was sent to you by <span class="il">Bei Fity</span> International Ltd.<br>
                  You are receiving this email because you signed up for <span class="il">Bei Fity</span>.<br>
                  <br>
                  <span class="il">Bei Fity</span> International Ltd. | 38 Greene St. | New York, NY 10013, USA</span></span></span></td>
                </tr>
            <tr><td><br>
            
             
            <div id="m_3025674106711546784_eoa_div" style="display:none;background-image:url('https://ci5.googleusercontent.com/proxy/3xgR5nxVI4aKjwOaQAX-1ge_4_k1-PAcP0--JQtR60q4EXIA2eNwhH4W457WKnMw1TbEPVVHz6-efcp8RtlNyYNI_gJNDA3jneV9xLAt7VIOUysmp4z_NrqPTGX_9yIJp8s=s0-d-e1-ft#https://VpBM5I1Och.eoapxl.com/VpBM5I1Och/7f4a33ed-8895-4bf1-8811-ad62b26fe196/P')"></div>
            <img id="m_3025674106711546784_eoa_img" src="https://ci6.googleusercontent.com/proxy/NGMRRs5wUGa3UWMs0eZfo684DWIzQJ2IQ4N4j07an4AEmH4jNOiVsJQupMx_FUfEJrI15nbOPf-Aa2a4vRHv08cAF5GiOqCVp2i9YfJtqkhJ-XRdzjVPKvZgicqDIN2S=s0-d-e1-ft#https://VpBM5I1Och.eoapxl.com/VpBM5I1Och/7f4a33ed-8895-4bf1-8811-ad62b26fe196" style="height:1px!important;width:1px!important;display:block;margin:0;padding:0;border:0" alt="" title="" border="0" width="1" height="1" class="CToWUd" data-bit="iit" jslog="138226; u014N:xr6bB; 53:W2ZhbHNlLDJd"> 
            </td></tr></tbody>
            </table>
            </td>
            </tr>
            </tbody>
            </table>
            </td>
            </tr>
            </tbody>
              </table>`
            })

               

            res.status(200).json({
                // _id:createdUser._id,
                // name:createdUser.name,
                // username:createdUser.username,
                // email:createdUser.email,
                // role:createdUser.role,
                // walletId:createdUser.walletId,
                // avatar:createdUser.avatar,
                //  token:generateToken(createdUser._id), 
                // createdAt:createdUser.createdAt,
                // updatedAt:createdUser.updatedAt
                success: true,
                // createdUser,
                token:generateToken(createdUser._id),
                message:`${createdUser.name}  Created succesfully`
 
            })
        }else{
            return res.status(401).json({
                message: "Email or password already exist"

           })
       }
        
    } catch (error) {
        res.status(500).json({
            error,
            success:false
        })
    }
})


authRoute.post("/sessions/login", async (req, res, next)=>{
    const {email,  password} = req.body

    const userAgent = req.headers['user-agent'];
    // // Retrieve device information from the request headers
    // let deviceName, os, osVersion, appVersion;

    // // let os = null;
    // // let osVersion = null;
    // // let appVersion = null;
    // // Check if the request is coming from a mobile device
    // if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
    //   deviceName = req.headers['user-agent'].match(/\(([^)]+)\)/)[1].split(';')[0].trim();
    //   os = req.headers['user-agent'].match(/\(([^)]+)\)/)[1].split(';')[1].trim();
    //   osVersion = req.headers['user-agent'].match(/(Android|CPU)\s+([\d._]+)/)[2];
    //   appVersion = req.headers['user-agent'].match(/(MyApp)\/([\d._]+)/)[2];
    // } else {
    //   // Request is coming from a desktop or laptop device
    //   deviceName = 'Desktop/Laptop';
    //   os = req.headers['user-agent'].match(/\(([^)]+)\)/)[1].split(';')[0].trim();
    //   osVersion = req.headers['user-agent'].match(/(Windows|Mac|Linux)\s+([\d._]+)/)[2];
    //   appVersion = 'N/A';
    // }

    // // Create a new device object with the retrieved information
    // const device = {
    //   deviceName: deviceName,
    //   os: os,
    //   osVersion: osVersion,
    //   appVersion: appVersion,
    //   lastLoggedIn: new Date(), 
    //   ip:req.ip
    // };
    
    try {
    if(!email || !password){
            return res.status(400).json({
                message: "Please enter your email and password"
            })
        }
        ///finding user with match email and password
        const user = await Users.findOne({email}).select('+password')


        if (!user) {

             return res.status(401).json({
                message: "Invalid  email and password"
            })
        }

        ///checks if paswoord is correct 
        
        const isPasswordMatched =  await user.comparePassword(password)
        if (!isPasswordMatched) {

            return res.status(401).json({
               message: "Invalid  email and password"
           })
       }else{

        // await Users.updateOne({ _id: user._id}, {$set: {devices: device}}, {
        //     new:true,
        //     runValidators:true,
        //     useFindAndModify:false
        // } )
       
           res.status(200).json({

                success: true,
                user,
                token:generateToken(user._id), 
                message:`Hello ${user.name} you are logged in  successfully`


           })
       }  
      } catch (error) {
        res.status(401).json({
            error,
            success:false
        })
    }
})

///log out
authRoute.get("/sessions/logout", async (req, res, next)=>{
    res.cookie("token", null, {
        expires:new Date(Date.now()),
        httpOnly:true
    })
    res.status(200).json({
        success:true,
        message: "logout success"
    })
  
        
    
})

// ///seller details and shop
// authRoute.get("/seller/user/details", isAuthenticatedUser, authorizeRoles('admin', "seller"), async (req, res, next)=>{
//     const userToken = req.user.id;

//     const user = await Users.findById(userToken)
//     if(user){
//         res.status(200).json({
//             user,
//             success:true,
//             message: "User details found  successfully"
//         })
//     }
//     res.status(404).json({
//         success:false,
//         message: "seller details not found. Please login as a seller or contact support for details "
//     })
  
        
    
// })

//forgot password

authRoute.post("/sessions/forgot_password", async (req, res, next)=>{
    const user = await Users.findOne({email: req.body.email})

    if(!user){
        return res.status(404).json({
            message: "User not found"
        })
    }

    ///get reset tokens
    const resetToken = await user.GetResetPasswordToken();

    await user.save({validateBefore: false})

    ///create reset password url email

    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/password_reset/${resetToken}`;
    const message = `Your password reset token is as follows:\n\n${resetUrl}\n\nIf you have not requested this email , then please ignore it`
 
    try {
        // await sendEmail({
        //     email:user.email,
        //     subject:"Password recovery",
        //     message
        // })
        const sendMailTo = (user.email)

         // /email semding

        sendEmail({
            to:sendMailTo,
            subject:`Reset password for ${user.username}`,
            text:`
            Hello ${user.username}, Reset your password!
            `,
            html:`
            
            <html>
            <body>
            <div id=":1ra" class="a3s aiL msg-590680061552799253"><u></u>
  
  
  

  


        <div style="height:100%!important;margin:0;padding:0;width:100%!important">
        
          
          <span style="display:none;font-size:1px;line-height:1px;max-width:0;max-height:0;min-width:0;min-height:0;height:0;width:0;opacity:0;overflow:hidden;color:#ffffff"></span>
        
          
          <div style="display:none;white-space:nowrap;font:15px courier;line-height:0"> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; </div>
        
          <table align="center" style="border-collapse:collapse!important;min-width:100%" cellpadding="0" cellspacing="0" width="100%">
            <tbody><tr>
              <td class="m_-590680061552799253mobile-hide" height="44" bgcolor="#EDEDED" colspan="3">
          
              </td>
            </tr>
            <tr>
              <td class="m_-590680061552799253mobile-hide" width="58" bgcolor="#EDEDED" style="min-width:10px;width:1%"></td>
              <td>
                
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse!important">
        
                  <tbody><tr>
                    <td height="115" align="center" class="m_-590680061552799253mobile-no-padding" bgcolor="#EDEDED">
                      <table border="0" cellpadding="0" cellspacing="0" width="616" style="border-collapse:collapse!important">
                        <tbody><tr>
                          <td colspan="2" width="616" bgcolor="#DADADA" height="5" style="font-size:5px;line-height:5px;max-height:5px">
                            &nbsp; 
                          </td>
                        </tr>
                        <tr>
                          <td height="110" bgcolor="#ffffff">
                            <table class="m_-590680061552799253mobile-no-padding m_-590680061552799253header" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse!important;height:110px">
        <tbody><tr>
          <td class="m_-590680061552799253mobile-no-padding m_-590680061552799253text-padding-left" height="110" width="180" align="left" style="padding-left:58px">
            <a align="left" style="word-wrap:break-word;font-size:18px;font-weight:900;color:#222222;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;padding:54px 0 14px 0;text-align:left;letter-spacing:0.02em" href=" ${req.protocol}://beifity.com" style="color:#000000" target="_blank" >
              Beifity
            </a>
          </td>
          <td class="m_-590680061552799253mobile-hide m_-590680061552799253mobile-no-padding m_-590680061552799253text-padding-right" width="450" height="110" align="right" style="padding-right:58px">
            <table border="0" cellpadding="0" cellspacing="0" style="border-collapse:collapse!important">
              <tbody><tr>
                <td align="right" style="padding-bottom:2px">
                  <span style="color:#3e3e3e;text-decoration:none;text-transform:uppercase;padding:6px 0 5px 0;letter-spacing:2px;line-height:22px;font-weight:400;font-size:11px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif">We’re here to help</span>
                </td>
              </tr>
            </tbody></table>
          </td>
        </tr>
                    </tbody></table>
                  </td>
                </tr>
              </tbody></table>
            </td>
          </tr>
        </tbody></table>
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse!important">
          <tbody><tr>
            <td bgcolor="#EDEDED" align="center">
              <table border="0" cellpadding="0" cellspacing="0" width="616" class="m_-590680061552799253responsive-table" style="border-collapse:collapse!important">
                <tbody><tr>
                  <td>
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse:collapse!important">
        
        <tbody><tr>
          <td bgcolor="#F7F7F7" class="m_-590680061552799253text-padding-left m_-590680061552799253text-padding-right m_-590680061552799253large-padding-bottom" style="padding-left:58px;padding-bottom:44px;padding-right:58px">
        
          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse:collapse!important">
            <tbody><tr>
          <td align="left" style="word-wrap:break-word;font-size:15px;font-weight:900;color:#222222;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;padding:54px 0 14px 0;text-align:left;letter-spacing:0.02em">
        
              Reset your Beifity logins
            </td>
        </tr>
        
        
            <tr>
          <td align="left" class="m_-590680061552799253standard-line m_-590680061552799253body-text" style="padding:6px 0 16px 0;line-height:22px;font-weight:400;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:14px;letter-spacing:0.02em;color:#555555;text-align:left">
        
              
                Congratulations! Here is your account  reset link.
              
              
                Here’s some important information about your account. Please save this email so you can refer to it later.
        
              
            </td>
        </tr>
        
        
            <tr>
          <td align="left" class="m_-590680061552799253standard-line m_-590680061552799253body-text" style="padding:6px 0 16px 0;line-height:22px;font-weight:400;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:14px;letter-spacing:0.02em;color:#555555;text-align:left">
        
              <div class="m_-590680061552799253label" style="font-size:12px;font-weight:600;color:#222222;letter-spacing:1px;text-transform:uppercase;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif">
                Your email address:
              </div>
              <div class="m_-590680061552799253body-text" style="font-weight:400;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:14px;letter-spacing:0.02em;color:#555555;text-align:left">
              ${user.email}
              </div>
            </td>
        </tr>
        
            <tr>
          <td align="left" class="m_-590680061552799253standard-line m_-590680061552799253body-text" style="padding:6px 0 16px 0;line-height:22px;font-weight:400;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:14px;letter-spacing:0.02em;color:#555555;text-align:left">
        
              <div class="m_-590680061552799253label" style="font-size:12px;font-weight:600;color:#222222;letter-spacing:1px;text-transform:uppercase;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif">
                Your login  username:
              </div>
              <div class="m_-590680061552799253body-text" style="font-weight:400;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:14px;letter-spacing:0.02em;color:#555555;text-align:left">
                <a class="m_-590680061552799253appleLinkIgnore" style="color:#000000">${user.username}</a>
              </div>
            </td>
        </tr>
        
        
            
              <tr>
          <td align="left" class="m_-590680061552799253sub-heading" style="font-size:21px;font-weight:200;color:#222222;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;padding:26px 0 18px 0;letter-spacing:0.02em;line-height:22px">
        
        
                Reset password link
              </td>
        </tr>
        
        
              <tr>
          <td align="left" class="m_-590680061552799253standard-line m_-590680061552799253body-text" style="padding:6px 0 16px 0;line-height:22px;font-weight:400;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:14px;letter-spacing:0.02em;color:#555555;text-align:left">
        
            ${req.protocol}://beifity.com/password_reset/${resetToken}
        
              </td>
        </tr>
        
            
          </tbody></table>
        
          
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse:collapse!important">
          <tbody><tr>
            <td align="left" class="m_-590680061552799253button" style="padding:0 0 22px 0;line-height:22px">
              <table border="0" cellspacing="0" cellpadding="0" class="m_-590680061552799253responsive-table" style="border-collapse:collapse!important">
                <tbody><tr>
                  <td align="left">
                    
                    
                    <a class="m_-590680061552799253black-button" href="${req.protocol}://${req.get('host')}/api/v1/password_reset/${resetToken}" style="color:#000000;font-size:10px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-weight:500;letter-spacing:1px;text-decoration:none;display:inline-block;text-transform:uppercase;text-align:left;border-top:11px solid #3e3e3e;border-bottom:11px solid #3e3e3e;border-left:22px solid #3e3e3e;border-right:22px solid #3e3e3e;background-color:#3e3e3e;color:#ffffff;font-size:10px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-weight:500;letter-spacing:1px;text-decoration:none;padding:0 19px;display:inline-block;text-transform:uppercase;text-align:left" >click here</a>
                  </td>
                </tr>
              </tbody></table>
            </td>
          </tr>
        </tbody></table>
        
          
        
          
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse:collapse!important">
              <tbody><tr>
          <td align="left" class="m_-590680061552799253sub-heading" style="font-size:21px;font-weight:200;color:#222222;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;padding:26px 0 18px 0;letter-spacing:0.02em;line-height:22px">
        
        
          
            We’re here to help
          
        </td>
        </tr>
        
        
        <tr>
          <td align="left" class="m_-590680061552799253standard-line m_-590680061552799253body-text" style="padding:6px 0 16px 0;line-height:22px;font-weight:400;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:14px;letter-spacing:0.02em;color:#555555;text-align:left">
        
        
          
        </td>
        </tr>
        
        
            </tbody></table>
          
        
          </td>
        </tr>
        
        </tbody></table>
        
        </td>
        </tr>
        
        
        </tbody></table>
        </td>
        </tr>
        </tbody></table>
        </td>
        <td width="58" class="m_-590680061552799253mobile-hide" bgcolor="#EDEDED" style="min-width:10px;width:1%"></td>
        </tr>
        <tr>
          <td class="m_-590680061552799253footer" colspan="3">
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse!important">
              <tbody><tr>
                <td class="m_-590680061552799253text-padding-left m_-590680061552799253text-padding-right" height="115" align="center" bgcolor="#EDEDED" style="padding-left:58px;padding-right:58px">
                  <table border="0" cellpadding="0" cellspacing="0" style="border-collapse:collapse!important">
                    <tbody>
        
                  </tbody></table>
                </td>
              </tr>
            </tbody></table>
          </td>
        </tr>
        </tbody></table>
        
        <div class="yj6qo"></div><div class="adL">
        </div></div><div class="adL">
        </div></div>

            </body>
            </html>

            
            
            `
        })



        res.status(200).json({
            success: true,
            message: `Email sent to: ${user.email} `
        })
        
    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({validateBefore: false})
        return res.status(500).json({
            success: false,
            message:"There was an error reseting your password. Please try again",
            error
        })

        
    }


  
        
    
})


//reset password
authRoute.put("/password_reset/:token", async (req, res, next)=>{

    //hash url tokens
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex')

    const user = await Users.findOne({ 
        resetPasswordToken, resetPasswordExpire: {$gt: Date.now()}
    })
    if (!user){
        return res.status(500).json({
            success: false,
            message:"password reset token is invalid or expired",
        })
    }
    if(req.body.password !== req.body.confirmPassword){
        return res.status(400).json({
            success: false,
            message:"password does not match",
            
        })
    }

    ///setup new password
    user.password = req.body.password;

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    sendToken(user, 200, res )

  
  
})
 //get currently logged in user

authRoute.get("/me",isAuthenticatedUser, async (req, res, next)=>{
    try {
        const user = await Users.findById(req.user.id);
        res.status(200).json({
            success: true,
            message: 'User found successfully',
            user
        })
        } catch (error) {
            res.status(400).json({
                success: false,
                message: 'There was an error',
                error
            })
        }
    
})


//  ////get user
//  productRoute.get("/user/:id",  async(req,res, next) => {
//   let product = await Users.findById(req.params.id)
//   if(!product) {
//       res.status(500).json({
//           success: false,
//           message:"Product not found"
//       })
//   }
//   await product.remove();
//   res.status(200).json({
//       success: true,
//       message:"Product deleted successfully",
//   })   
//  })


///update and change password
authRoute.put("/password_update", isAuthenticatedUser, async (req, res, next)=>{
    const user = await Users.findById(req.user.id).select("+password")
    ///check previous user password

    const isMatched = await user.comparePassword(req.body.oldPassword)
 
        if (!isMatched) {
            res.status(400).json({
                success: false,
                message: 'There was an error in old  password',
                
            }) 

        }

        user.password = req.body.password;
        await user.save();
        // sendToken(user, 200, res )   
        res.status(200).json({
            success: true,
            user,
            message:"This route will update password"
        }) 
    
})

///update and change user profile
authRoute.put("/profile_update", isAuthenticatedUser, async (req, res, next)=>{
    const newUser = {
        name: req.body.name, 
        username: req.body.username,
        email: req.body.email,
        role: req.body.role
    }

    const user = await Users.findByIdAndUpdate(req.user.id, newUser,{
        new:true,
        runValidators:true,
        useFindAndModify:false
    })
    res.status(200).json({
        success: true,
        message: 'User updated successfully',
        
    })

})

///update contact number
authRoute.put("/contact_update", isAuthenticatedUser, async (req, res, next)=>{
    const newUser = {
        contact: req.body.contact
    } 
    try {
        const user = await Users.findByIdAndUpdate(req.user.id, newUser,{
            new:true,
            runValidators:true,
            useFindAndModify:false
        })
        res.status(200).json({

            user,
            success: true,
            message: 'Contact updated successfully',
            
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Contact not updated!',
            
        })
    }
    

})
///update and change user profile
authRoute.put("/shop/update", isAuthenticatedUser, authorizeRoles('admin', "seller" , "superadmin"), async (req, res, next)=>{
    const userId = req.user.id
    const newUser = {
        shop: req.body.shop,   
    }

    const user = await Users.findByIdAndUpdate(userId, newUser,{
        new:true,
        runValidators:true,
        useFindAndModify:false
    })
    res.status(200).json({
        user,
        success: true,
        message: 'User shop details  updated successfully',
        
    })

})

///admin routes

//get all users 


authRoute.get("/admin/users",isAuthenticatedUser,  authorizeRoles('admin'),  async(req,res, next) => {

    const users = await Users.find()
    console.log(req.user.id)

    try {
        res.status(200).json({
            success: true,
            users,
            message:"This route will show all users in the database"
        })
    } catch (error) {
        res.status(404).json({
            success: false,
            error,
            message:"There are no users in the database"
        })
    }
    
    
     
 })

 ////get user details 
 
authRoute.get("/admin/user/:id",isAuthenticatedUser,  authorizeRoles('admin', "superadmin"),  async(req,res, next) => {

    const users = await Users.findById(req.params.id)
    if (!users) {
        res.status(404).json({
            success: false,
            error,
            message:"There is no user  in the database with the Id"
        })
    }
        res.status(200).json({
            success: true,
            users,
            message:"This route will show a user in the database"
        })
    
    
     
 })


 ///update and change user profile
authRoute.put("/admin/profile_update/:id", isAuthenticatedUser,authorizeRoles('admin', "superadmin"), async (req, res, next)=>{
    const newUser = {
        name: req.body.name, 
        email: req.body.email,
        role: req.body.role,
    }

    const user = await Users.findByIdAndUpdate(req.params.id, newUser,{
        new:true,
        runValidators:true,
        useFindAndModify:false
    })
    res.status(200).json({
        success: true,
        message: 'Admin  updated user successfully',
        
    })

})

//admin delete user

authRoute.delete("/admin/user/:id",isAuthenticatedUser,  authorizeRoles('admin' , "superadmin"),  async(req,res, next) => {

    const user = await Users.findById(req.params.id)
    if (!user) {
        res.status(404).json({
            success: false,
            error,
            message:"There is no user  in the database with the Id"
        })
    }


   
 
    try {
       
        await user.remove();
        res.status(200).json({
            success: true,
            message:`Deleted user ${user.email}`
        })
        
    } catch (error) {
        
        return res.status(500).json({
            success: false,
            message:"There was an error Deleting the account. Please try again",
            error
        })



    }

    
    
    
     
 })


export default authRoute;