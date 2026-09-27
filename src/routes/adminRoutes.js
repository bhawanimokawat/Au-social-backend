const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");



const { getAllUsers,updateUserRole,deleteUser,getAllPostsAdmin,deletePostAdmin,getAllReports,updateReportStatus} = require("../controllers/adminController");

// Temporary admin middleware test
router.get("/test",authMiddleware,adminMiddleware,(req, res) => {
    return res.status(200).json({
      success: true,
      message: "Admin middleware is working",
    });
  }
);

// Get all users
router.get("/users", authMiddleware, adminMiddleware, getAllUsers);
router.put("/users/:userId/role",authMiddleware,adminMiddleware,updateUserRole);
router.delete("/users/:userId",  authMiddleware, adminMiddleware, deleteUser);
router.get( "/posts", authMiddleware, adminMiddleware, getAllPostsAdmin);
router.delete( "/posts/:postId", authMiddleware, adminMiddleware, deletePostAdmin);
// Get all reports
router.get(  "/reports", authMiddleware, adminMiddleware, getAllReports);
// Resolve or dismiss report
router.put(  "/reports/:reportId/status",  authMiddleware,  adminMiddleware,  updateReportStatus);


module.exports = router;