const express = require("express");
const router = express.Router();


const authMiddleware = require("../middleware/authMiddleware");
const { createPost,getPostById,getAllPosts,updatePost,deletePost,likePost} = require("../controllers/postController");

router.post("/", authMiddleware, createPost);
router.get("/:id", authMiddleware, getPostById);
router.get("/", authMiddleware, getAllPosts);
router.put("/:id", authMiddleware, updatePost);
router.delete("/:id",authMiddleware,deletePost);
router.post("/:id/like", authMiddleware, likePost);



module.exports = router;