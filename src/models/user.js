const mongoose = require("mongoose");
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["student", "teacher", "mentor", "alumni", "admin"],
      default: "student",
    },

    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationOTP: {
      type: String,
    },
    verificationOTPExpire: {
      type: Date,
    },
    resetPasswordToken: {
      type: String,
    },

    resetPasswordExpire: {
      type: Date,
    },
    batchNumber: {
      type: String,
      trim: true,
    },

    bio: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    linkedin: {
      type: String,
      trim: true,
    },

    github: {
      type: String,
      trim: true,
    },

    instagram: {
      type: String,
      trim: true,
    },

    skills: [
      {
        type: String,
        trim: true,
      },
    ],

    resume: {
      type: String,
      trim: true,
    },

    jobStatus: {
      type: String,
      enum: [
        "Looking for Job",
        "Looking for Internship",
        "Open to Opportunities",
        "Not Looking",
      ],
      default: "Not Looking",
    },

    profilePicture: {
      type: String,
      default: ""
    }

  },

  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);