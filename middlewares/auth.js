import jwt from 'jsonwebtoken'
import Users from '../models/user.js';

//// checks if user is auth

 export const isAuthenticatedUser =  async(req, res , next)=>{
     let token

     if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")){
        try {
            token = req.headers.authorization.split(" ")[1]
            const decoded = jwt.verify(token, process.env.JWT_SECRET)
            req.user =  await Users.findById(decoded.id).select("-password");
            next()
        } catch (error) {
            res.status(401).json({
                message:"Not authenticated. Please login!",
                success:false, 
                error
               })
        }
     }
     if(!token){
         res.status(401).json({
         message:"Not authenticated. Please login!",
         success:false
        })
     }

    // const {token } = req.cookies;
    // if (!token) {
    //     res.status(401).json({ 
    //         message:"Not authenticated.Please login!",
    //         success: false
    //      })
        
    // }const decoded = jwt.verify(token, process.env.JWT_SECRET)
    // req.user =  await Users.findById(decoded.id);
    

}

///user roles

export const authorizeRoles =  (...roles) =>{
    return async(req, res , next)=> {

        let token

     if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")){
        try {
            token = req.headers.authorization.split(" ")[1]
            const decoded = jwt.verify(token, process.env.JWT_SECRET)
            req.user =  await Users.findById(decoded.id).select("-password");
            if(!roles.includes(req.user.role)){
                console.log("roles ====> role is not working as usual"  )
                res.status(403).json({ 
                    message:`${req.user.role} are not allowed to access this resource!`,
                    success: false
                 })
            }
            next()
        } catch (error) {
            res.status(401).json({
                message:"Not authenticated. Please login!",
                success:false, 
                error
               })
        }
     }
        // const {token } = req.cookies;
        // const decoded = jwt.verify(token, process.env.JWT_SECRET)
        // req.user =  await Users.findById(decoded.id);
        // console.log(roles)
        // if(!roles.includes(req.user.role)){
        //     console.log("roles ====> role is not working as usual"  )
        //     res.status(403).json({ 
        //         message:`${req.user.role} are not allowed to access this resource!`,
        //         success: false
        //      })
        // }
        // next()
    }
    

}

///superAdmin role
