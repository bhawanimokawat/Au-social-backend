const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const { createTeacherProfile, getTeacherProfile, updateTeacherProfile,getAllTeachers,searchTeachers ,getTeacherPosts,followTeacher,unfollowTeacher} = require("../controllers/teacherController");




router.post("/", authMiddleware, createTeacherProfile);
router.get("/search",authMiddleware,searchTeachers);
router.post( "/:id/follow", authMiddleware, followTeacher);
router.put("/profile", authMiddleware, updateTeacherProfile);
router.get("/",authMiddleware,getAllTeachers);
router.get("/:id", authMiddleware, getTeacherProfile);
router.get("/:id/posts", authMiddleware, getTeacherPosts);
router.delete(  "/:id/follow",  authMiddleware,  unfollowTeacher);





module.exports = router;