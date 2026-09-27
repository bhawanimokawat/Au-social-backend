const mongoose = require("mongoose");
const teacherProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    bio: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    designation: {
      type: String,
      trim: true,
    },

    expertise: [
      {
        type: String,
        trim: true,
      },
    ],

    teachingTags: [
      {
        type: String,
        trim: true,
      },
    ],

    experience: {
      type: Number,
      min: 0,
    },

    linkedin: {
      type: String,
      trim: true,
    },

    github: {
      type: String,
      trim: true,
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "TeacherProfile",
  teacherProfileSchema
);