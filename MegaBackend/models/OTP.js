const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");
const emailTemplate = require("../mail/templates/emailVerificationTemplate");

const OTPSchema = new mongoose.Schema({

    email:{
        type:String,
        required:true,
    },
    otp:{
        type:String,
        required:true,
    },
    createdAt:{
        type:Date,
        default:Date.now(),
        expires: 5*60,
    }

})


async function sendVerificationEmail(email,otp) {
    try{

        const mailResponse = await mailSender(email,"Verification email from StudyNotion",emailTemplate(otp));
        console.log("Email sent Successfully",mailResponse);

    }catch(err){
        console.log("error occured while sending email",err);
        throw err;
    }
}


OTPSchema.pre("save",async function(){
    
    await sendVerificationEmail(this.email,this.otp);

})


module.exports = mongoose.model("OTP",OTPSchema);