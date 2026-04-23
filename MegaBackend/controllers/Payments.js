const {instance} = require("../config/razorpay");
const Course = require("../models/Course");
const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const {courseEnrollmentEmail} = require("../mail/templates/courseEnrollmentEmail");
const { default: mongoose } = require("mongoose");
const crypto = require("crypto");
const { paymentSuccessEmail } = require("../mail/templates/paymentSuccessEmail");
const CourseProgress = require("../models/CourseProgress");



exports.capturePayment = async (req,res) => {

    const {courses} = req.body
    const userId = req.user.id;

    if(courses.length === 0){
        return res.json({
            success:false,
            message:"Please provide Course Id"
        })
    }

    let totalAmount = 0;

    for(const course_id of courses){
        let course;
        try{

            course = await Course.findById(course_id);
            if(!course){
                return res.status(200).json({
                    success:false,
                    message:"Could not find the course"
                })
            }

            const uid = new mongoose.Types.ObjectId(userId);
            if(course.studentsEnrolled.includes(uid)){
                return res.status(200).json({
                    success:false,
                    message:"Student is already Enrolled"
                })
            }

            totalAmount += course.price;

        }catch(err){

            console.log(err)
            return res.status(500).json({
                success:false,
                message:err.message
            })

        }
    }

    const currency = "INR";
    const options = {
        amount: totalAmount * 100,
        currency,
        receipt: Math.random(Date.now()).toString(),
    } 

    try{

        const paymentResponse = await instance.orders.create(options)
        res.json({
            success:true,
            message:paymentResponse,
        })

    }catch(err){
        console.log(err);
        return res.status(500).json({
            success:false,
            message:"Could not Initiate Order"
        })
    }

}


exports.verifyPayment = async (req,res) => {
    const razorpay_order_id = req.body?.razorpay_order_id;
    const razorpay_payment_id = req.body?.razorpay_payment_id;
    const razorpay_signature = req.body?.razorpay_signature;
    const courses = req.body?.courses;
    const userId = req.user.id;

    if(!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !courses || !userId){
        return res.status(200).json({
            success:false,
            message:"Payment Failed"
        })
    }

    let body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET).update(body.toString()).digest("hex")

    if(expectedSignature === razorpay_signature){
        await enrollStudents(courses, userId);

        return res.status(200).json({
            success:true,
            message:"Payment Verified",
        })
    }

    return res.status(200).json({
        success:false,
        message:"Payment Failed"
    })
}

const enrollStudents = async (courses, userId) => {

    if (!courses || !userId) {
        throw new Error("Missing courses or userId");
    }

    for (const courseId of courses) {

        const enrolledCourse = await Course.findByIdAndUpdate(
            courseId,
            { $push: { studentsEnrolled: userId } },
            { new: true }
        );

        if (!enrolledCourse) {
            throw new Error("Course not found");
        }

        const courseProgress = await CourseProgress.create({
            courseID: courseId,
            userId: userId,
            completedVideos: [],
        })

        const enrolledStudent = await User.findByIdAndUpdate(
            userId,
            { $push: { 
                courses: courseId,
                courseProgress: courseProgress._id,
             } },
            { new: true }
        );

        // ✅ FIXED EMAIL BUG
        await mailSender(
            enrolledStudent.email,
            `Successfully Enrolled into ${enrolledCourse.courseName}`,
            courseEnrollmentEmail(
                enrolledCourse.courseName,
                enrolledStudent.firstName
            )
        );
    }

    return true;
};

exports.sendPaymentSuccessEmail = async (req,res) => {
    const {orderId, paymentId, amount} = req.body;

    const userId = req.user.id;

    if(!orderId || !paymentId || !amount || !userId) {
        return res.status(400).json({
            success:false,
            message:"Please provide all the fields"
        })
    }

    try{
        const enrolledStudent = await User.findById(userId);
        await mailSender(
            enrolledStudent.email,
            `Payment Recieved`,
            paymentSuccessEmail(`${enrolledStudent.firstName}`,
                amount/100, orderId, paymentId
            )
            
        )
    }catch(err){
        console.log("error in sending mail", err)
        return res.status(500).json({success:false, message:"Could not send email"})
    }
}







// exports.capturePayment = async (req,res) => {
    
//     const {course_id} = req.body;
//     const userId = req.user.id;

//     if(!course_id){
//         return res.json({
//             success:false,
//             message:'Please provide valid course ID',
//         })
//     }

//     let course;
//     try{

//         course = await Course.findById(course_id);
//         if(!course){
//             return res.json({
//                 success:false,
//                 message:'Could not find the course',
//             })
//         }

//         const uid = new mongoose.Types.ObjectId(userId);
//         if(course.studentsEnrolled.includes(uid)){
//              return res.status(200).json({
//                 success:false,
//                 message:'Student is already enrolled',
//             });
//         }

//     }catch(err){
//         console.error(err);
//         return res.status(500).json({
//             success:false,
//             message:err.message,
//         });
//     }


//     const amount = course.price;
//     const currency = "INR";

//     const options = {
//         amount: amount*100,
//         currency,
//         receipt:Math.random(Date.now()).toString(),
//         notes:{
//             courseId:course_id,
//             userId,
//         }
//     }


//     try{

//         const paymentResponse = await instance.orders.create(options);
//         console.log(paymentResponse); 

//         return res.status(200).json({
//             success:true,
//             courseName:course.courseName,
//             courseDescription:course.courseDescription,
//             thumbnail: course.thumbnail,
//             orderId:paymentResponse.orderId,
//             amount:paymentResponse.amount,
//             currency:paymentResponse.currency
//         })

//     }catch(err){
//         console.log(err);
//         res.json({
//             success:false,
//             message:"Could not initiate order",
//         });
//     }
// }





// exports.verifySignature = async (req,res) => {
//     const webhookSecret ="12345678";

//     const signature = req.headers["x-razorpay-signature"];

//     const shasum = crypto.createHmac("sha256",webhookSecret);
//     shasum.update(JSON.stringify(req.body));
//     const digest = shasum.digest("hex");
    
//     if(signature === digest){
//         console.log("Payment is Authorised");

//         const {courseId, userId} = req.body.payload.payment.entity.notes;

//         try{

//             const enrolledCourse = await Course.findByIdAndUpdate({_id:courseId},
//                 {
//                     $push:{
//                         studentsEnrolled:userId
//                     }
//                 },
//                 {new:true},
//             ) 
            
//             if(!enrolledCourse){
//                 return res.status(500).json({
//                     success:false,
//                     message:'Course not Found',
//                 });
//             }

//             console.log(enrolledCourse);

//             const enrolledStudent = await User.findByIdAndUpdate({_id:userId},
//                 {
//                     $push:{
//                         courses:courseId
//                     }
//                 },
//                 {new:true}
//             )

//             console.log(enrolledStudent);

//             const emailResponse = await mailSender(
//                                     enrolledStudent.email,
//                                     "Congratulations from CodeHelp",
//                                     "Congratulations, you are onboarded into new CodeHelp Course",
//             );

//             console.log(emailResponse);


//             return res.status(200).json({
//                 success:true,
//                 message:"Signature Verified and COurse Added",
//             });

//         }catch(err){
//             console.log(err);
//             return res.status(500).json({
//                 success:false,
//                 message:err.message,
//             });
//         }

//     }
//     else{
//         return res.status(400).json({
//             success:false,
//             message:'Invalid request',
//         });
//     }
// }