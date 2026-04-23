
const User=require("../models/User");
const jwt=require("jsonwebtoken");
require("dotenv").config();

// exports.auth = async (req,res,next)=>{

//     try{

//         const token = req.body.token || req.cookies.token || req.header("Authorization").replace("Bearer ","");

//         if(!token){
//             return res.status(401).json({
//                 success:false,
//                 message:"Token is missing"
//             })
//         }

//         try{

//             const decode = jwt.verify(token,process.env.JWT_SECRET);
//             console.log(decode);
//             req.user = decode;

//         }catch(err){

//             return res.status(401).json({
//                 success:false,
//                 message:"Token is invalid"
//             })

//         }
//         next();

//     }catch(err){

//         return res.status(401).json({
//             success:false,
//             message:"Something went wrong while validating the token"
//         })

//     }

// }

exports.auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Authorization header missing",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token missing",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: err.message,
    });
  }
};



exports.isStudent = async (req,res,next) =>{
    try{

        if(req.user.accountType !== "Student"){
            return res.status(401).json({
                success:false,
                message:"This is Protected Routes for Student only"
            })
        }

        next();

    }catch(err){

        return res.status(500).json({
            success:false,
            message:"User role cannot be verified"
        })

    }
}



exports.isAdmin = async (req,res,next) =>{
    try{

        if(req.user.accountType !== "Admin"){
            return res.status(401).json({
                success:false,
                message:"This is Protected Routes for Admin only"
            })
        }

        next();

    }catch(err){

        return res.status(500).json({
            success:false,
            message:"User role cannot be verified"
        })

    }
}




exports.isInstructor = async (req,res,next) =>{
    try{

        if(req.user.accountType !== "Instructor"){
            return res.status(401).json({
                success:false,
                message:"This is Protected Routes for Instructor only"
            })
        }

        next();

    }catch(err){

        return res.status(500).json({
            success:false,
            message:"User role cannot be verified"
        })

    }
}