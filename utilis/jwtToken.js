///create and send to cookie
import jwt from 'jsonwebtoken'

const generateToken =(id) => {
    return jwt.sign({id}, process.env.JWT_SECRET ,
    {
        expiresIn:"30d",
    });
}

// const sendToken = (id)=>{

//     //create jwt token and
//     const token = user.getJwtToken();
    

//     //options for cookies
//     const options = {
//         expires: new Date(
//             Date.now() + process.env.COOKIE_EXPIRATION * 24 * 60 * 60 * 1000
//         ),
//         httpOnly: true
//     }

//     res.status(statusCode).cookie("token", token, options).json({ 
//         success: true,
//         token,
//         user
//      })


// }

export default generateToken