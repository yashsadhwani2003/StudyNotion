
const User = require("../models/User");
const mailsender = require("../utils/mailSender");
const bcrypt=require("bcrypt");


exports.resetPasswordToken = async (req,res) =>{
    try{

        const email = req.body.email;

        const user = await User.findOne({email:email});
        if(!user){
            return res.status(401).json({
                success:false,
                message:"Your Email is not Registered"
            })
        }

        const token = crypto.randomUUID();

        const updatedDetails = await User.findOneAndUpdate({email:email},
            {
                token:token,
                resetPasswordExpires:Date.now() + 5*60*1000,
            },
            {new:true}
        );

        const url = `http://localhost:3000/update-password/${token}`;

        await mailsender(email,"Password Reset Link",`Password reset link ${url}`);

        return res.json({
            success:true,
            message:"Email sent successfully, Please Change password"
        })

    }catch(err){
        console.log(err);
        return res.status(500).json({
            success:false,
            message:"Soomething went wromg while sending the mail"
        })
    }
}



exports.resetPassword = async (req,res) =>{
    try{

        const {password,confirmPassword,token} = req.body;

        if(password !== confirmPassword){
            return res.json({
                success:false,
                message:"Password and ConfirmPass not matching"
            })
        }

        const user = await User.findOne({token:token});
        if(!user){
            return res.json({
                success:false,
                message:"Token is invalid"
            })
        }

        if(user.resetPasswordExpires < Date.now() ){
            return res.status(403).json({
                success:false,
                message:"Token is expired,please regenerate your token"
            })
        }

        const hashedPass = await bcrypt.hash(password,10);

        await User.findOneAndUpdate({token:token},{password:hashedPass},{new:true});

        return res.status(200).json({
            success:true,
            message:"Password reset Successfully"
        })

    }catch(err){
        console.log(err);
        return res.status(500).json({
            success:false,
            message:"Soomething went wromg while reseting the password"
        })
    }
}