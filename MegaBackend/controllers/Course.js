const Course = require("../models/Course");
const User = require("../models/User");
const CourseProgress = require("../models/CourseProgress")
const {uploadImageToCloudinary} = require("../utils/imageUploader");
const Category = require("../models/Category");
const { convertSecondsToDuration } = require("../utils/secToDuration");
const Section = require("../models/Section")
const SubSection = require("../models/SubSection")
require("dotenv").config();

exports.createCourse = async (req,res) => {
    try{

        let {courseName, courseDescription, whatYouWillLearn, price, tag: _tag, category, status, instructions: _instructions} = req.body;

        const thumbnail = req.files.thumbnailImage;

        const tag = JSON.parse(_tag)
        const instructions = JSON.parse(_instructions)


        console.log("tag", tag)
        console.log("instructions", instructions)


        if(!courseName || !courseDescription || !whatYouWillLearn || !price || !tag.length || !thumbnail || !category || !instructions.length){
            return res.status(400).json({
                success:false,
                message:"All feilds are required"
            })
        }
        if (!status || status === undefined) {
			status = "Draft";
		}


        const userId=req.user.id;
        const instructorDetails = await User.findById(userId, {
            accountType: "Instructor",
        });
        console.log(instructorDetails);

        if(!instructorDetails){
            return res.status(404).json({
                success:false,
                message:"Instructor details are not found"
            })
        }

        const categoryDetails = await Category.findById(category);
        if(!categoryDetails){
            return res.status(404).json({
                success:false,
                message:"Category details are not found"
            })
        }

        const thumbnailImage = await uploadImageToCloudinary(thumbnail,process.env.FOLDER_NAME);


        const newCourse = await Course.create({
            courseName,
            courseDescription,
            instructor: instructorDetails._id,
            whatYouWillLearn: whatYouWillLearn,
            price,
            tag,
            category: categoryDetails._id,
            thumbnail:thumbnailImage.secure_url,
            status: status,
			instructions,
        })

        await User.findByIdAndUpdate(
            {_id:instructorDetails._id},
            {
                $push:{
                    courses:newCourse._id
                }
            },
            {new:true}
        );

        await Category.findByIdAndUpdate(
            {_id:category},
            {
                $push:{
                    courses:newCourse._id,
                }
            },
            {new:true},
        )


        return res.status(200).json({
            success:true,
            message:"Course created Successfully",
            data:newCourse,
        });



    }catch(err){
        console.error(err);
        return res.status(500).json({
            success:false,
            message:"Failed to create a course",
            error:err.message
        })

    }
}


exports.editCourse = async (req, res) => {
    try{

        const {courseId} = req.body;
        const updates = req.body;
        const course = await Course.findById(courseId)
        
        if(!course){
            return res.status(404).json({
                error: "Course not found"
            })
        }

        if(req.files){
            console.log("thumbnail update")
            const thumbnail = req.files.thumbnailImage
            const thumbnailImage = await uploadImageToCloudinary(
                thumbnail,
                process.env.FOLDER_NAME
            )
            course.thumbnail = thumbnailImage.secure_url
        }


        for (const key in updates){
            if (key === "courseId") continue;

            if (key === "tag" || key === "instructions") {
                course[key] = JSON.parse(updates[key]);
            } else {
                course[key] = updates[key];
            }
        }

        await course.save()

        const updatedCourse = await Course.findOne({
            _id: courseId,
        })
        .populate({
            path: "instructor",
            populate: {
            path: "additionalDetails",
            },
        })
        .populate("category")
        .populate("ratingAndReviews")
        .populate({
            path: "courseContent",
            populate: {
            path: "subSection",
            },
        })
        .exec()


        res.json({
            success: true,
            message: "Course updated successfully",
            data: updatedCourse,
        })

    }catch(err){
        console.error(err)
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: err.message,
        })
    }
}





exports.showAllCourses = async (req,res) => {
    try{

        const allCourses = await Course.find(
            { status: "Published" },
            {
                courseName: true,
                price: true,
                thumbnail: true,
                instructor: true,
                ratingAndReviews: true,
                studentsEnrolled: true,
            }
        ).populate("instructor").exec();

        return res.status(200).json({
            success:true,
            message:"Data for all courses fetch Successfully",
            data:allCourses
        })


    }catch(err){
        console.error(err);
        return res.status(500).json({
            success:false,
            message:"Cannot fetch course data",
            error:err.message
        })
    }
}





exports.getCourseDetails = async (req,res) => {
    try{

        const {courseId} = req.body;


        const courseDetails = await Course.findOne({_id:courseId})
                                                    .populate(
                                                        {
                                                            path:"instructor",
                                                            populate:{
                                                                path:"additionalDetails"
                                                            }
                                                        }    
                                                    )
                                                    .populate("category")
                                                    .populate("ratingAndReviews")
                                                    .populate({
                                                        path:"courseContent",
                                                        populate:{
                                                            path:"subSection",
                                                            select: "-videoUrl",
                                                        }
                                                    })
                                                    .exec();
        
        if(!courseDetails){
            return res.status(400).json({
                success:false,
                message:`Could not find the course with ${courseId}`
            })
        }

        let totalDurationInSeconds = 0
        courseDetails.courseContent.forEach((content) => {
            content.subSection.forEach((subSection) => {
                const timeDurationInSeconds = parseInt(subSection.timeDuration)
                totalDurationInSeconds += timeDurationInSeconds
            })
        })

        const totalDuration = convertSecondsToDuration(totalDurationInSeconds)


        return res.status(200).json({
            success:true,
            message:"Course details fetched successfully",
            data:{
                courseDetails,
                totalDuration,
            }
        })


    }catch(err){
        console.log(err);
        return res.status(500).json({
            success:false,
            message:err.message,
        }
        )
    }
}


exports.getFullCourseDetails = async (req,res) => {
    try{
        const {courseId} = req.body
        const userId = req.user.id

        const courseDetails = await Course.findOne({
            _id: courseId,
        }).populate({
            path: "instructor",
            populate: {
                path: "additionalDetails",
            },
        })
        .populate("category")
        .populate("ratingAndReviews")
        .populate({
            path: "courseContent",
            populate: {
                path: "subSection",
            },
        })
        .exec()


        let courseProgressCount = await CourseProgress.findOne({
            courseID: courseId,
            userId: userId,
        })

        console.log("courseProgressCount : ", courseProgressCount)

        if (!courseDetails) {
            return res.status(400).json({
                success: false,
                message: `Could not find course with id: ${courseId}`,
            })
        }


        let totalDurationInSeconds = 0
        courseDetails.courseContent.forEach((content) => {
            content.subSection.forEach((subSection) => {
                const timeDurationInSeconds = parseInt(subSection.timeDuration)
                totalDurationInSeconds += timeDurationInSeconds
            })
        })

        const totalDuration = convertSecondsToDuration(totalDurationInSeconds)


        return res.status(200).json({
            success: true,
            data: {
                courseDetails,
                totalDuration,
                completedVideos: courseProgressCount?.completedVideos
                    ? courseProgressCount?.completedVideos
                    : [],
            },
        })
    }catch(err){
        return res.status(500).json({
            success: false,
            message: err.message,
        })
    }
}

exports.getInstructorCourses = async (req,res) => {
    try{
        const instructorId = req.user.id

        const instructorCourses = await Course.find({
            instructor: instructorId,
        }).sort({ createdAt: -1 })

        res.status(200).json({
            success: true,
            data: instructorCourses,
        })
    }catch(err){
        console.error(err)
        res.status(500).json({
            success: false,
            message: "Failed to retrieve instructor courses",
            error: err.message,
        })
    }
}


exports.deleteCourse = async (req,res) => {
    try{
        const {courseId} = req.body

        const course = await Course.findById(courseId)

        if(!course){
            return res.status(404).json({
                message: "Course not found"
            })
        }

        const studentsEnrolled = course.studentsEnrolled
        for (const studentId of studentsEnrolled) {
            await User.findByIdAndUpdate(studentId, {
                $pull: { courses: courseId },
            })
        }


        const courseSections = course.courseContent
        for(const sectionId of courseSections){
            const section = await Section.findById(sectionId)
            if(section){
                const subSection = section.subSection
                for(const subSectionId of subSection){
                    await SubSection.findByIdAndDelete(subSectionId)
                }
            }

            await Section.findByIdAndDelete(sectionId)

        }

        await Course.findByIdAndDelete(courseId)

        return res.status(200).json({
            success: true,
            message: "Course deleted successfully",
        })

    }catch(err){

        console.error(err)
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: err.message,
        })

    }
}