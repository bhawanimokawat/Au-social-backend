const validateProfile = (req, res, next) => {
  const {name,batchNumber, bio, linkedin, github, instagram, skills, resume, jobStatus,} = req.body;

  // Name validation
  if (name !== undefined) {
    if (typeof name !== "string" || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Name must be a valid string",
      });
    }
  }

  // Batch number validation
  if (batchNumber !== undefined) {
    if (
      typeof batchNumber !== "string" ||
      batchNumber.trim().length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Batch number must be a valid string",
      });
    }
  }

  // Bio validation
  if (bio !== undefined) {
    if (typeof bio !== "string") {
      return res.status(400).json({
        success: false,
        message: "Bio must be a string",
      });
    }

    if (bio.length > 500) {
      return res.status(400).json({
        success: false,
        message: "Bio cannot exceed 500 characters",
      });
    }
  }

  // Skills validation
  if (skills !== undefined) {
    if (!Array.isArray(skills)) {
      return res.status(400).json({
        success: false,
        message: "Skills must be an array",
      });
    }

    if (!skills.every((skill) => typeof skill === "string")) {
      return res.status(400).json({
        success: false,
        message: "Each skill must be a string",
      });
    }
  }

  // Job status validation
  const allowedJobStatuses = [
    "Looking for Job",
    "Looking for Internship",
    "Open to Opportunities",
    "Not Looking",
  ];

  if (jobStatus !== undefined) {
    if (!allowedJobStatuses.includes(jobStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid job status",
      });
    }
  }

  // URL validation
  const urlFields = {
    linkedin,
    github,
    instagram,
    resume,
  };

  for (const [field, value] of Object.entries(urlFields)) {
    if (value !== undefined && value !== "") {
      try {
        new URL(value);
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: `${field} must be a valid URL`,
        });
      }
    }
  }

  next();
};

module.exports = validateProfile;