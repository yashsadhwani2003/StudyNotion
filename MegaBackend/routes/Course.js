const express = require("express");
const router = express.Router();

const {auth, isInstructor, isStudent, isAdmin} = require("../middlewares/auth")
const {createCourse, showAllCourses, getCourseDetails, getFullCourseDetails, editCourse, getInstructorCourses, deleteCourse} = require("../controllers/Course");


const {createSection, updateSection, deleteSection} = require("../controllers/Section");
const {createSubSection, updatedSubSection, deleteSubSection} = require("../controllers/SubSection");


const {createCategory, showAllCategory, categoryPageDetails} = require("../controllers/Category");


const {createRating, getAverageRating, getAllRatingReview} = require("../controllers/RatingAndReview");

const { updateCourseProgress } = require("../controllers/courseProgress")


router.post("/createCourse", auth, isInstructor, createCourse);
router.get("/getAllCourses", showAllCourses);
router.post("/getCourseDetails",getCourseDetails);
router.post("/getFullCourseDetails", auth, getFullCourseDetails);
router.post("/editCourse", auth, isInstructor, editCourse)
router.get("/getInstructorCourses", auth, isInstructor, getInstructorCourses)
router.delete("/deleteCourse", deleteCourse)
router.post("/updateCourseProgress", auth, isStudent, updateCourseProgress);



router.post("/addSection", auth, isInstructor, createSection);
router.post("/updateSection", auth, isInstructor, updateSection);
router.post("/deleteSection", auth, isInstructor, deleteSection);
router.post("/addSubSection", auth, isInstructor, createSubSection);
router.post("/updateSubSection", auth, isInstructor, updatedSubSection);
router.post("/deleteSubSection", auth, isInstructor, deleteSubSection);

router.post("/createCategory", auth, isAdmin, createCategory);
router.get("/showAllCategories", showAllCategory);
router.post("/getCategoryPageDetails", categoryPageDetails);

router.post("/createRating", auth, isStudent, createRating);
router.get("/getAverageRating", getAverageRating);
router.get("/getReviews", getAllRatingReview)


module.exports = router;
