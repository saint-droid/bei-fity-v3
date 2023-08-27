import jwt from 'jsonwebtoken'
import Users from '../models/user.js';



///handling users roles
const authorizeRoles =  (...roles) =>{
    return (req, res , next)=> {
        if(!roles.includes(req.user.role)){
            res.status(403).json({ 
                message:"You are not allowed to access this resource!",
                success: false
             })
        }
        next()
    }
    
    next()

}

export default authorizeRoles
// export default authorizeRoles