const Comment = require("../models/comments");
const Post = require("../models/post");

const createComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;

    // Check content
    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Comment content is required",
      });
    }

    // Check whether post exists
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Create comment
    const comment = await Comment.create({
      post: postId,
      author: req.user.userId,
      content: content.trim(),
    });

    // Get author information
    const populatedComment = await Comment.findById(comment._id)
      .populate("author", "name profilePicture");

    return res.status(201).json({
      success: true,
      message: "Comment added successfully",
      comment: populatedComment,
    });
  } catch (error) {
    console.error("Create comment error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


const getComments = async (req, res) => {
  try {
    const { postId } = req.params;

    // Check whether post exists
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Get comments for this post
    const comments = await Comment.find({ post: postId })
      .populate("author", "name profilePicture")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Comments fetched successfully",
      totalComments: comments.length,
      comments,
    });
  } catch (error) {
    console.error("Get comments error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const deleteComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;

    // Find the comment
    const comment = await Comment.findOne({
      _id: commentId,
      post: postId,
    });

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    // Check comment ownership
    if (comment.author.toString() !== req.user.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this comment",
      });
    }

    // Delete comment
    await Comment.findByIdAndDelete(commentId);

    return res.status(200).json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    console.error("Delete comment error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

 

module.exports = {
  createComment,getComments,deleteComment,
};