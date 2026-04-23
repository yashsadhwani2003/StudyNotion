const User = require("../models/User");
const OTP = require("../models/OTP");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mailSender = require("../utils/mailSender");
const Profile = require("../models/Profile");
const { passwordUpdated } = require("../mail/templates/passwordUpdate");
require("dotenv").config();



exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    // 1️⃣ Email validation
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // 2️⃣ Check if user already exists
    const check = await User.findOne({ email });

    if (check) {
      return res.status(409).json({
        success: false,
        message: "User already registered",
      });
    }

    // 3️⃣ Generate OTP
    let otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    console.log("OTP generated:", otp);

    // 4️⃣ Ensure OTP is unique
    let result = await OTP.findOne({ otp });

    while (result) {
      otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });

      result = await OTP.findOne({ otp });
    }

    // 5️⃣ Save OTP
    const otpBody = await OTP.create({
      email,
      otp,
      createdAt: Date.now(),
    });

    console.log("OTP saved:", otpBody);

    // 6️⃣ Response (DO NOT send OTP to frontend)
    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });

  } catch (err) {
    console.log("SEND OTP ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to send OTP",
    });
  }
};




exports.signup = async (req,res) => {
    try{

        const {
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            accountType,
            contactNumber,
            otp
        } = req.body;

        if(!firstName || !lastName || !email || !password || !confirmPassword || !otp){
            return res.status(403).json({
                success:false,
                message:"All feilds are required"
            })
        }

        if(password!==confirmPassword){
            return res.status(400).json({
                success:false,
                message:"Password and ConfirmPassword dosent match, please try again"
            })
        }

        const check = await User.findOne({email});
        if(check){
            return res.status(400).json({
                success:false,
                message:"User already Exist. Please sign in to continue."
            })
        }

        const recentOtp = await OTP.find({email}).sort({createdAt:-1}).limit(1);
        console.log(recentOtp);

        if(recentOtp.length===0){
            return res.status(400).json({
                success:false,
                message:"OTP not found"
            })
        }
        else if(otp !== recentOtp[0].otp){
            return res.status(400).json({
                success:false,
                message:"Invalid OTP"
            })
        }

        const hashedPass = await bcrypt.hash(password,10);


        const profileDetails = await Profile.create({
            gender:null,
            dateOfBirth:null,
            about:null,
            contactNumber:null
        }) 

        const user = await User.create({
            firstName,
            lastName,
            email,
            contactNumber,
            password:hashedPass,
            accountType,
            additionalDetails:profileDetails._id,
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`
        })

        
        return res.status(200).json({
            success:true,
            message:"User is registered Successfully",
            user
        })


    }catch(err){
        console.log(err);
        return res.status(500).json({
            success:false,
            message:"User cannot be registered. Please try again",
        })
    }
} 



exports.login = async (req,res) => {
    try{

        const {email,password} = req.body;
        
        if(!email || !password){
            return res.status(403).json({
                success:false,
                message:"All feilds are required , please try again"
            })
        }

        const user = await User.findOne({email}).populate("additionalDetails");
        if(!user){
            return res.status(401).json({
                success:false,
                message:"User is not registered , please signup first"
            })
        }

        if(await bcrypt.compare(password,user.password)){

            const payload={
                email:user.email,
                id:user._id,
                accountType:user.accountType,
            }
            const token = jwt.sign(payload,process.env.JWT_SECRET,{
                expiresIn:"2h"
            })
            user.token = token
            user.password = undefined

            const options = {
                expires: new Date(Date.now() + 3*24*60*60*1000),
                httpOnly:true
            } 
            res.cookie("token",token,options).status(200).json({
                success:true,
                token,
                user,
                message:"Logged in Successfully"
            })
        }
        else{
            return res.status(401).json({
                success:false,
                message:"Password incorrect"
            })
        }

    }catch(err){
        console.log(err);
        return res.status(500).json({
            success:false,
            message:"Login Failure, please try again"
        })
    }
}


exports.changePassword = async (req,res) => {
    try{

        const {oldPassword,newPassword,confirmNewPassword} = req.body;
        
        const userId = req.user.id;
        const userDetails = await User.findById(userId);

        const isPasswordMatch = await bcrypt.compare(oldPassword,userDetails.password);

        if(!isPasswordMatch){
            return res.status(401).json({ 
                success: false, 
                message: "The password is incorrect" 
            });
        }
        if(newPassword !== confirmNewPassword){
            return res.status(400).json({
				success: false,
				message: "The password and confirm password does not match",
			});
        }


        const encryptedPass = await bcrypt.hash(newPassword,10);

        const updatedUserDetails = await User.findByIdAndUpdate(userId,{password:encryptedPass},{new:true});


        try{

            const emailResponse = await mailSender(updatedUserDetails.email,
                passwordUpdated(
					updatedUserDetails.email,
					`Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
				)
            )
            console.log("Email sent successfully:", emailResponse.response);

        }catch(err){
            console.error("Error occurred while sending email:", err);
			return res.status(500).json({
				success: false,
				message: "Error occurred while sending email",
				error: err.message,
			});
        }
        
        return res
			.status(200)
			.json({ success: true, message: "Password updated successfully" });

    }catch(err){
        console.error("Error occurred while updating password:", err);
		return res.status(500).json({
			success: false,
			message: "Error occurred while updating password",
			error: err.message,
		});
    }
}