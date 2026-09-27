const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const validateProfile = require("../middleware/validateProfileMiddleware")
const { getMyProfile , updateMyProfile, getUserProfile,searchUsers,searchUsersBySkill,searchUsersByBatch,filterUsersByRole,discoverUsers} = require("../controllers/userControllers");

router.get("/profile", authMiddleware, getMyProfile);
router.put("/profile", authMiddleware,validateProfile, updateMyProfile);
router.get("/search",authMiddleware,searchUsers);
router.get("/search/skills",authMiddleware,searchUsersBySkill);
router.get("/search/batch",authMiddleware,searchUsersByBatch);
router.get("/filter/role",authMiddleware,filterUsersByRole);
router.get("/discover",authMiddleware,discoverUsers);
router.get("/:id", authMiddleware, getUserProfile);


 

module.exports = router;