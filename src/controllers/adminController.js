const User = require("../models/user");
const Post = require("../models/post");
const Comment = require("../models/comments");
const Connection = require("../models/connection");
const Follow = require("../models/follow");
const Notification = require("../models/Notification");
const TeacherProfile = require("../models/teacherprofile");
const Report =  require("../models/report");



const getAllPostsAdmin = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("author", "name email role profilePicture")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "All posts fetched successfully",
      totalPosts: posts.length,
      posts,
    });
  } catch (error) {
    console.error("Admin get posts error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


const deletePostAdmin = async (req, res) => {
  try {
    const { postId } = req.params;

    // Find post
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Delete comments belonging to this post
    await Comment.deleteMany({
      post: postId,
    });

    // Delete the post
    await Post.findByIdAndDelete(postId);

    return res.status(200).json({
      success: true,
      message: "Post deleted by admin successfully",
    });
  } catch (error) {
    console.error("Admin delete post error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select(
        "name email role profilePicture batchNumber bio skills jobStatus createdAt"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      totalUsers: users.length,
      users,
    });
  } catch (error) {
    console.error("Get all users error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    const adminId = req.user.userId;

    const allowedRoles = [
      "student",
      "teacher",
      "mentor",
      "alumni",
      "admin",
    ];

    // Prevent admin from changing their own role
    if (adminId.toString() === userId.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot change your own role",
      });
    }

    // Validate role
    if (!role || typeof role !== "string") {
      return res.status(400).json({
        success: false,
        message: "Role is required",
      });
    }

    const normalizedRole = role.trim().toLowerCase();

    if (!allowedRoles.includes(normalizedRole)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    // Find user
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update role
    user.role = normalizedRole;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "User role updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Update user role error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const adminId = req.user.userId;

    // Admin cannot delete themselves
    if (adminId.toString() === userId.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account",
      });
    }

    // Check whether user exists
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Get user's posts before deleting them
    const userPosts = await Post.find({
      author: userId,
    }).select("_id");

    const postIds = userPosts.map((post) => post._id);

    // Delete user's posts
    await Post.deleteMany({
      author: userId,
    });

    // Delete user's comments
    await Comment.deleteMany({
      author: userId,
    });

    // Delete comments from the user's posts
    if (postIds.length > 0) {
      await Comment.deleteMany({
        post: { $in: postIds },
      });
    }

    // Remove user's likes from other users' posts
    await Post.updateMany(
      {
        likes: userId,
      },
      {
        $pull: {
          likes: userId,
        },
      }
    );

    // Delete connections
    await Connection.deleteMany({
      $or: [
        { sender: userId },
        { receiver: userId },
      ],
    });

    // Delete follows
    await Follow.deleteMany({
      $or: [
        { follower: userId },
        { following: userId },
      ],
    });

    // Delete notifications
    await Notification.deleteMany({
      $or: [
        { recipient: userId },
        { sender: userId },
      ],
    });

    // Delete teacher/mentor profile if it exists
    await TeacherProfile.deleteOne({
      user: userId,
    });

    // Finally delete the user
    await User.findByIdAndDelete(userId);

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const getAllReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate("reporter", "name email role profilePicture")
      .populate(
        "post",
        "content image author createdAt"
      )
      .populate(
        "post.author",
        "name email role profilePicture"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Reports fetched successfully",
      totalReports: reports.length,
      reports,
    });
  } catch (error) {
    console.error("Get all reports error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const updateReportStatus = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      "resolved",
      "dismissed",
    ];

    if (!status || typeof status !== "string") {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    const normalizedStatus = status.trim().toLowerCase();

    if (!allowedStatuses.includes(normalizedStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid report status",
      });
    }

    const report = await Report.findById(reportId);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    if (report.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending reports can be updated",
      });
    }

    report.status = normalizedStatus;

    await report.save();

    return res.status(200).json({
      success: true,
      message: `Report ${normalizedStatus} successfully`,
      report,
    });
  } catch (error) {
    console.error(
      "Update report status error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  getAllUsers,updateUserRole,deleteUser,getAllPostsAdmin,getAllPostsAdmin,deletePostAdmin,getAllReports,updateReportStatus,
};