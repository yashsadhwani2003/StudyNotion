const RatingAndReview = require("../models/RatingAndReview");
const Course = require("../models/Course");
const { default: mongoose } = require("mongoose");

exports.createRating = async (req,res) => {
    try{

        const userId = req.user.id;

        const {rating,review,courseId} = req.body;

        const courseDetail = await Course.findOne( { _id:courseId,studentsEnrolled: {$elemMatch: {$eq: userId} } });

        if(!courseDetail){
            return res.status(404).json({
                success:false,
                message:"Student is not enrolled in the course",
            })
        }

        const alreadyReviewed = await RatingAndReview.findOne({user:userId,course:courseId});
        if(alreadyReviewed){
            return res.status(403).json({
                success:false,
                message:"Course is already reviewed by the user",
            })
        }



        const ratingReview = await RatingAndReview.create({rating,review,user:userId,course:courseId});

        const updatedCourse = await Course.findByIdAndUpdate({_id: courseId}, {$push: {ratingAndReviews: ratingReview._id} },{new: true});
        console.log(updatedCourse);

        return res.status(200).json({
            success:true,
            message:"Rating and Review created successfully",
            ratingReview 
        })

    }catch(err){
        console.log(err);
        return res.status(500).json({
            success:false,
            message:err.message
        })
    }
}




exports.getAverageRating = async (req,res) => {
    try{

        const courseId = req.body.courseId;

        const result = await RatingAndReview.aggregate([
            {
                $match:{
                    course:new mongoose.Types.ObjectId(courseId),
                },
            },
            {
                $group:{
                    _id:null,
                    averageRating:{ $avg: "$rating" },
                }
            }
        ])

        if(result.length > 0){
            return res.status(200).json({
                success:true,
                averageRating:result[0].averageRating
            })
        }

        return res.status(200).json({
            success:true,
            message:"Average rating is 0, no rating given till now",
            averageRating:0,
        })

    }catch(err){
        console.log(err);
        return res.status(500).json({
            success:false,
            message:err.message
        })
    }
}



exports.getAllRatingReview = async (req,res) => {
    try{

        const allReviews = await RatingAndReview.find({})
                                                 .sort({rating:"desc"})
                                                 .populate({
                                                    path:"user",
                                                    select:"firstName lastName email image"
                                                 })
                                                 .populate({
                                                    path:"course",
                                                    select:"courseName",
                                                 }).exec();
        
        return res.status(200).json({
            success:true,
            message:"All review fetched successfully",
            data:allReviews
        })

    }catch(err){
        console.log(err);
        return res.status(500).json({
            success:false,
            message:err.message
        })
    }
}