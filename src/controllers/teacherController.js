const TeacherProfile = require("../models/teacherprofile");
const User = require("../models/user");
const Post = require("../models/post");
const Follow =require("../models/follow");

const createTeacherProfile = async (req, res) => {
    try {
        const userId = req.user.userId;

        const {
            bio,
            designation,
            expertise,
            teachingTags,
            experience,
            linkedin,
            github,
            isAvailable,
        } = req.body;

        // Check user
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Only teacher or mentor can create this profile
        if (user.role !== "teacher" && user.role !== "mentor") {
            return res.status(403).json({
                success: false,
                message: "Only teachers or mentors can create this profile",
            });
        }

        // Check if profile already exists
        const existingProfile = await TeacherProfile.findOne({
            user: userId,
        });

        if (existingProfile) {
            return res.status(409).json({
                success: false,
                message: "Teacher/Mentor profile already exists",
            });
        }

        // Create profile
        const profile = await TeacherProfile.create({
            user: userId,
            bio,
            designation,
            expertise,
            teachingTags,
            experience,
            linkedin,
            github,
            isAvailable,
        });

        return res.status(201).json({
            success: true,
            message: "Teacher/Mentor profile created successfully",
            profile,
        });
    } catch (error) {
        console.error(
            "Create teacher profile error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

const getTeacherProfile = async (req, res) => {
    try {
        const { id } = req.params;

        const profile = await TeacherProfile.findOne({
            user: id,
        }).populate(
            "user",
            "name email role profilePicture"
        );

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: "Teacher/Mentor profile not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Teacher/Mentor profile fetched successfully",
            profile,
        });
    } catch (error) {
        console.error(
            "Get teacher profile error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

const updateTeacherProfile = async (req, res) => {
    try {
        const userId = req.user.userId;

        const {
            bio,
            designation,
            expertise,
            teachingTags,
            experience,
            linkedin,
            github,
            isAvailable,
        } = req.body;

        // Find teacher/mentor profile
        const profile = await TeacherProfile.findOne({
            user: userId,
        });

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: "Teacher/Mentor profile not found",
            });
        }

        // Update only fields that were provided
        if (bio !== undefined) { profile.bio = bio; }
        if (designation !== undefined) { profile.designation = designation;}

        if (expertise !== undefined) {
            profile.expertise = expertise;
        }

        if (teachingTags !== undefined) {
            profile.teachingTags = teachingTags;
        }

        if (experience !== undefined) {
            profile.experience = experience;
        }

        if (linkedin !== undefined) {
            profile.linkedin = linkedin;
        }

        if (github !== undefined) {
            profile.github = github;
        }

        if (isAvailable !== undefined) {
            profile.isAvailable = isAvailable;
        }

        await profile.save();

        return res.status(200).json({
            success: true,
            message: "Teacher/Mentor profile updated successfully",
            profile,
        });
    } catch (error) {
        console.error(
            "Update teacher profile error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

const getAllTeachers = async (req, res) => {
  try {
    const profiles = await TeacherProfile.find()
      .populate(
        "user",
        "name email role profilePicture"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Teachers/Mentors fetched successfully",
      totalProfiles: profiles.length,
      profiles,
    });
  } catch (error) {
    console.error(
      "Get all teachers error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const searchTeachers = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const searchRegex = new RegExp(query.trim(), "i");

    // Find matching users
    const users = await User.find({
      role: { $in: ["teacher", "mentor"] },
      $or: [
        { name: searchRegex },
      ],
    }).select("_id name email role profilePicture");

    const userIds = users.map((user) => user._id);

    // Find matching teacher/mentor profiles
    const profiles = await TeacherProfile.find({
      $or: [
        { user: { $in: userIds } },
        { designation: searchRegex },
        { expertise: searchRegex },
        { teachingTags: searchRegex },
      ],
    })
      .populate(
        "user",
        "name email role profilePicture"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Teachers/Mentors search completed successfully",
      totalProfiles: profiles.length,
      profiles,
    });
  } catch (error) {
    console.error(
      "Search teachers error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


const getTeacherPosts = async (req, res) => {
  try {
    const { id } = req.params;

    // Check teacher/mentor user exists
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Make sure the user is a teacher or mentor
    if (user.role !== "teacher" && user.role !== "mentor") {
      return res.status(400).json({
        success: false,
        message: "This user is not a teacher or mentor",
      });
    }

    // Check teacher/mentor profile exists
    const profile = await TeacherProfile.findOne({
      user: id,
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Teacher/Mentor profile not found",
      });
    }

    // Find posts created by this teacher/mentor
    const posts = await Post.find({
      author: id,
    })
      .populate("author", "name email role profilePicture")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Teacher/Mentor posts fetched successfully",
      totalPosts: posts.length,
      posts,
    });
  } catch (error) {
    console.error(
      "Get teacher posts error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const followTeacher = async (req, res) => {
  try {
    const followerId = req.user.userId;
    const { id: teacherId } = req.params;

    // Cannot follow yourself
    if (followerId.toString() === teacherId.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot follow yourself",
      });
    }

    // Check teacher/mentor user exists
    const teacher = await User.findById(teacherId);

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Only teacher or mentor can be followed
    if (teacher.role !== "teacher" && teacher.role !== "mentor") {
      return res.status(400).json({
        success: false,
        message: "You can only follow teachers or mentors",
      });
    }

    // Check teacher profile exists
    const teacherProfile = await TeacherProfile.findOne({
      user: teacherId,
    });

    if (!teacherProfile) {
      return res.status(404).json({
        success: false,
        message: "Teacher/Mentor profile not found",
      });
    }

    // Check existing follow
    const existingFollow = await Follow.findOne({
      follower: followerId,
      following: teacherId,
    });

    if (existingFollow) {
      return res.status(400).json({
        success: false,
        message: "You are already following this teacher/mentor",
      });
    }

    // Create follow
    const follow = await Follow.create({
      follower: followerId,
      following: teacherId,
    });

    return res.status(201).json({
      success: true,
      message: "Teacher/Mentor followed successfully",
      follow,
    });
  } catch (error) {
    console.error("Follow teacher error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const unfollowTeacher = async (req, res) => {
  try {
    const followerId = req.user.userId;
    const { id: teacherId } = req.params;

    // Find existing follow
    const follow = await Follow.findOne({
      follower: followerId,
      following: teacherId,
    });

    if (!follow) {
      return res.status(404).json({
        success: false,
        message: "You are not following this teacher/mentor",
      });
    }

    // Remove follow
    await Follow.findByIdAndDelete(follow._id);

    return res.status(200).json({
      success: true,
      message: "Teacher/Mentor unfollowed successfully",
    });
  } catch (error) {
    console.error("Unfollow teacher error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
    createTeacherProfile, getTeacherProfile,updateTeacherProfile,getAllTeachers,searchTeachers,getTeacherPosts,
    followTeacher,unfollowTeacher
};