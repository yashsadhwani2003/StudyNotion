
const mongoose = require("mongoose");
require("dotenv").config();

exports.connect = ()=>{
    
    mongoose.connect(process.env.MONGODB_URL)
    .then(()=>{console.log("DB ka Connection ho gya")})
    .catch((err)=>{
        console.log("DB Coonnection me Issue h");
        console.error(err);
        process.exit(1);
    })
}