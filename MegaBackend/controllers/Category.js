
const { Mongoose } = require("mongoose");
const Category = require("../models/Category");
function getRandomInt(max) {
    return Math.floor(Math.random() * max)
  }

exports.createCategory = async (req,res) => {
    try{

        const {name,description} = req.body;

        if(!name || !description){
            return res.status(400).json({
                success:false,
                message:"All feilds are required"
            })
        } 

        const tagDetails = await Category.create({
            name:name,
            description:description
        })
        console.log(tagDetails);

        return res.status(200).json({
            success:true,
            message:"Category created Successfully"
        })

    }catch(err){
        return res.status(500).json({
                success:false,
                message:err.message
            })
    }
}


exports.showAllCategory = async (req,res) => {
    try{

        const allTags = await Category.find({});
        return res.status(200).json({
            success:true,
            message:"All Category returned Successfully",
            data:allTags
        })

    }catch(err){
        return res.status(500).json({
                success:false,
                message:err.message
            })
    }
}



exports.categoryPageDetails = async (req,res) => {
    try{

        const {categoryId} = req.body;

        const selectedCategory = await Category.findById(categoryId)
        .populate({
            path: "courses",
            match: { status: "Published" },
            populate: "ratingAndReviews",
        })
        .exec()

        if(!selectedCategory){
            return res.status(404).json({
                success:false,
                message:"Data Not Found",
            })
        }

        if (selectedCategory.courses.length === 0) {
            console.log("No courses found for the selected category.")
            return res.status(404).json({
            success: false,
            message: "No courses found for the selected category.",
            })
        }

        let differentCategory = null;

        const categoriesExceptSelected = await Category.find({
            _id: { $ne: categoryId },
        });

        if (categoriesExceptSelected.length > 0) {
            const randomIndex = getRandomInt(categoriesExceptSelected.length);
            const randomCategory = categoriesExceptSelected[randomIndex];

            if (randomCategory) {
                differentCategory = await Category.findById(randomCategory._id)
                    .populate({
                        path: "courses",
                        match: { status: "Published" },
                    })
                    .exec();
            }
        }
            //console.log("Different COURSE", differentCategory)
        // Get top-selling courses across all categories
        const allCategories = await Category.find()
            .populate({
            path: "courses",
            match: { status: "Published" },
            populate: {
                path: "instructor",
            },
            })
            .exec()
        const allCourses = allCategories.flatMap((category) => category.courses)
        const mostSellingCourses = allCourses
            .sort((a, b) => b.sold - a.sold)
            .slice(0, 10)
        // console.log("mostSellingCourses COURSE", mostSellingCourses)
        res.status(200).json({
            success: true,
            data: {
                selectedCategory,
                differentCategory,
                mostSellingCourses,
            },
        })

    }catch(err){
        console.log(err);
        return res.status(500).json({
            success:false,
            message:err.message,
        });
    }
}