const Post = require("../models/post");

const createPost = async (req, res) => {
  try {
    const { content, image } = req.body;

    // Reject unknown fields
    const allowedFields = ["content", "image"];

    const receivedFields = Object.keys(req.body);

    const hasUnknownField = receivedFields.some(
      (field) => !allowedFields.includes(field)
    );

    if (hasUnknownField) {
      return res.status(400).json({
        success: false,
        message: "Invalid fields in request",
      });
    }

    // Check content
    if (!content || typeof content !== "string") {
      return res.status(400).json({
        success: false,
        message: "Post content is required",
      });
    }

    const trimmedContent = content.trim();

    // Prevent empty content
    if (trimmedContent.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Post content cannot be empty",
      });
    }

    // Maximum content length
    if (trimmedContent.length > 2000) {
      return res.status(400).json({
        success: false,
        message: "Post content cannot exceed 2000 characters",
      });
    }

    // Validate image
    if (image !== undefined && typeof image !== "string") {
      return res.status(400).json({
        success: false,
        message: "Image must be a valid URL string",
      });
    }

    // Create post
    const post = await Post.create({
      author: req.user.userId,
      content: trimmedContent,
      image: image ? image.trim() : "",
    });

    return res.status(201).json({
      success: true,
      message: "Post created successfully",
      post,
    });
  } catch (error) {
    console.error("Create post error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const getPostById = async (req, res) => {
    try {
        const { id } = req.params;

        const post = await Post.findById(id)
            .populate("author", "name email role profilePicture");

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Post fetched successfully",
            post,
        });
    } catch (error) {
        console.error("Get post error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

const getAllPosts = async (req, res) => {
  try {
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;

    // Prevent invalid page numbers
    if (page < 1) {
      page = 1;
    }

    // Prevent very large requests
    if (limit < 1) {
      limit = 10;
    }

    if (limit > 50) {
      limit = 50;
    }

    const skip = (page - 1) * limit;

    // Get total number of posts
    const totalPosts = await Post.countDocuments();

    // Get posts
    const posts = await Post.find()
      .populate("author", "name email role profilePicture")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(totalPosts / limit);

    return res.status(200).json({
      success: true,
      message: "Posts fetched successfully",

      pagination: {
        currentPage: page,
        limit,
        totalPosts,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },

      posts,
    });
  } catch (error) {
    console.error("Get all posts error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, image } = req.body;

    // Find the post
    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Check post ownership
    if (post.author.toString() !== req.user.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this post",
      });
    }

    // Validate content if provided
    if (
      content !== undefined &&
      (!content || content.trim().length === 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "Post content cannot be empty",
      });
    }

    // Update allowed fields only
    if (content !== undefined) {
      post.content = content.trim();
    }

    if (image !== undefined) {
      post.image = image;
    }

    await post.save();

    return res.status(200).json({
      success: true,
      message: "Post updated successfully",
      post,
    });
  } catch (error) {
    console.error("Update post error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the post
    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Check post ownership
    if (post.author.toString() !== req.user.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this post",
      });
    }

    // Delete the post
    await Post.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    console.error("Delete post error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const likePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Find the post
    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Check whether user already liked the post
    const alreadyLiked = post.likes.some(
      (likeId) => likeId.toString() === userId.toString()
    );

    if (alreadyLiked) {
      // Unlike
      post.likes = post.likes.filter(
        (likeId) => likeId.toString() !== userId.toString()
      );

      await post.save();

      return res.status(200).json({
        success: true,
        message: "Post unliked successfully",
        likesCount: post.likes.length,
      });
    }

    // Like
    post.likes.push(userId);

    await post.save();

    return res.status(200).json({
      success: true,
      message: "Post liked successfully",
      likesCount: post.likes.length,
    });
  } catch (error) {
    console.error("Like post error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
    createPost, getPostById, getAllPosts,updatePost,deletePost,likePost
};