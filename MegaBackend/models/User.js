const mongoose=require("mongoose");

const userSchema = new mongoose.Schema({
    firstName:{
        type:String,
        trim:true,
        required:true
    },
    lastName:{
        type:String,
        trim:true,
        required:true
    },
    email:{
        type:String,
        trim:true,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    token:{
        type:String
    },
    resetPasswordExpires:{
        type:Date
    },
    accountType:{
        type:String,
        enum: ["Admin","Student","Instructor"]
    },
    additionalDetails:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"Profile"
    },
    active: {
        type: Boolean,
        default: true,
    },
    approved: {
        type: Boolean,
        default: true,
    },
    courses: [
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Course"
        }
    ],
    image:{
        type:String,
        required:true
    },
    courseProgress:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"CourseProgress"
        }
    ]
});

module.exports = mongoose.model("User",userSchema);