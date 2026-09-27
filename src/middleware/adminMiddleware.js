const User = require("../models/user");
const adminMiddleware = async (req, res, next) => {
  try {
    // authMiddleware must run first
    const userId = req.user.userId;

    // Find current user
    const user = await User.findById(userId).select("role");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check admin role
    if (user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    next();
  } catch (error) {
    console.error("Admin middleware error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = adminMiddleware;