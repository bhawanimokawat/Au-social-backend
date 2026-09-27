const Report = require("../models/report");
const Post = require("../models/post");

const createReport = async (req, res) => {
  try {
    const reporterId = req.user.userId;
    const { postId } = req.params;
    const { reason, description } = req.body;

    const allowedReasons = [
      "spam",
      "harassment",
      "inappropriate",
      "misinformation",
      "other",
    ];

    // Validate reason
    if (!reason || typeof reason !== "string") {
      return res.status(400).json({
        success: false,
        message: "Report reason is required",
      });
    }

    const normalizedReason = reason.trim().toLowerCase();

    if (!allowedReasons.includes(normalizedReason)) {
      return res.status(400).json({
        success: false,
        message: "Invalid report reason",
      });
    }

    // Check post exists
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Prevent users from repeatedly reporting the same post
    const existingReport = await Report.findOne({
      reporter: reporterId,
      post: postId,
      status: "pending",
    });

    if (existingReport) {
      return res.status(400).json({
        success: false,
        message: "You have already reported this post",
      });
    }

    // Validate description length
    if (
      description !== undefined &&
      typeof description !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Description must be a string",
      });
    }

    const trimmedDescription =
      description ? description.trim() : "";

    if (trimmedDescription.length > 500) {
      return res.status(400).json({
        success: false,
        message: "Description cannot exceed 500 characters",
      });
    }

    // Create report
    const report = await Report.create({
      reporter: reporterId,
      post: postId,
      reason: normalizedReason,
      description: trimmedDescription,
    });

    return res.status(201).json({
      success: true,
      message: "Post reported successfully",
      report,
    });
  } catch (error) {
    console.error("Create report error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  createReport,
};