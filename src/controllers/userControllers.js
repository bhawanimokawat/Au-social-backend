const User = require("../models/user");

const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const searchRegex = new RegExp(query.trim(), "i");

    const users = await User.find({
      $or: [
        { name: searchRegex },
        { email: searchRegex },
      ],
    })
      .select(
        "name email role profilePicture batchNumber bio skills jobStatus"
      )
      .limit(20);

    return res.status(200).json({
      success: true,
      message: "Users search completed successfully",
      totalUsers: users.length,
      users,
    });
  } catch (error) {
    console.error("Search users error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


const searchUsersBySkill = async (req, res) => {
  try {
    const { skill } = req.query;

    if (!skill || skill.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Skill is required",
      });
    }

    const skillRegex = new RegExp(skill.trim(), "i");

    const users = await User.find({
      skills: skillRegex,
    })
      .select(
        "name email role profilePicture batchNumber bio skills jobStatus"
      )
      .limit(20);

    return res.status(200).json({
      success: true,
      message: "Users searched by skill successfully",
      totalUsers: users.length,
      users,
    });
  } catch (error) {
    console.error(
      "Search users by skill error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


const searchUsersByBatch = async (req, res) => {
  try {
    const { batchNumber } = req.query;

    if (!batchNumber || batchNumber.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Batch number is required",
      });
    }

    const batchRegex = new RegExp(batchNumber.trim(), "i");

    const users = await User.find({
      batchNumber: batchRegex,
    })
      .select(
        "name email role profilePicture batchNumber bio skills jobStatus"
      )
      .limit(20);

    return res.status(200).json({
      success: true,
      message: "Users searched by batch successfully",
      totalUsers: users.length,
      users,
    });
  } catch (error) {
    console.error(
      "Search users by batch error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const filterUsersByRole = async (req, res) => {
  try {
    const { role } = req.query;

    const allowedRoles = [
      "student",
      "teacher",
      "mentor",
      "alumni",
      "admin",
    ];

    if (!role || role.trim() === "") {
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

    const users = await User.find({
      role: normalizedRole,
    })
      .select(
        "name email role profilePicture batchNumber bio skills jobStatus"
      )
      .limit(20);

    return res.status(200).json({
      success: true,
      message: "Users filtered by role successfully",
      totalUsers: users.length,
      users,
    });
  } catch (error) {
    console.error(
      "Filter users by role error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const discoverUsers = async (req, res) => {
  try {
    const { query, skill, batchNumber, role } = req.query;

    const allowedRoles = [
      "student",
      "teacher",
      "mentor",
      "alumni",
      "admin",
    ];

    const filter = {};

    // Search by name or email
    if (query && query.trim() !== "") {
      const searchRegex = new RegExp(query.trim(), "i");

      filter.$or = [
        { name: searchRegex },
        { email: searchRegex },
      ];
    }

    // Filter by skill
    if (skill && skill.trim() !== "") {
      filter.skills = new RegExp(skill.trim(), "i");
    }

    // Filter by batch
    if (batchNumber && batchNumber.trim() !== "") {
      filter.batchNumber = new RegExp(
        batchNumber.trim(),
        "i"
      );
    }

    // Filter by role
    if (role && role.trim() !== "") {
      const normalizedRole = role.trim().toLowerCase();

      if (!allowedRoles.includes(normalizedRole)) {
        return res.status(400).json({
          success: false,
          message: "Invalid role",
        });
      }

      filter.role = normalizedRole;
    }

    const users = await User.find(filter)
      .select(
        "name email role profilePicture batchNumber bio skills jobStatus"
      )
      .limit(20);

    return res.status(200).json({
      success: true,
      message: "User discovery completed successfully",
      totalUsers: users.length,
      users,
    });
  } catch (error) {
    console.error(
      "Discover users error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const getMyProfile = async (req, res) => {
  try {
    console.log("User ID:", req.user.userId);

    const user = await User.findById(req.user.userId)
      .select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile fetched successfully",
      user,
    });
  } catch (error) {
    console.error("Get profile error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const updateMyProfile = async (req, res) => {
  try {
    const {
      name,
      batchNumber,
      bio,
      linkedin,
      github,
      instagram,
      skills,
      resume,
      jobStatus,
      profilePicture,
    } = req.body;

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (name !== undefined) user.name = name;
    if (batchNumber !== undefined) user.batchNumber = batchNumber;
    if (bio !== undefined) user.bio = bio;
    if (linkedin !== undefined) user.linkedin = linkedin;
    if (github !== undefined) user.github = github;
    if (instagram !== undefined) user.instagram = instagram;
    if (skills !== undefined) user.skills = skills;
    if (resume !== undefined) user.resume = resume;
    if (jobStatus !== undefined) user.jobStatus = jobStatus;
    if(profilePicture !== undefined) user.profilePicture = profilePicture;

    await user.save();

    const updatedUser = await User.findById(req.user.userId)
      .select("-password");

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update profile error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      "-password -verificationOTP -verificationOTPExpire -resetPasswordToken -resetPasswordExpire"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User profile fetched successfully",
      user,
    });
  } catch (error) {
    console.error("Get user profile error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  getMyProfile,updateMyProfile,getUserProfile,searchUsers,searchUsersBySkill,searchUsersByBatch,filterUsersByRole,discoverUsers,
};