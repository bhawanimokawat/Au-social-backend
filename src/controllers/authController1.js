const User = require("../models/user");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/GenerateToken");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");

const register = async (req, res) => {

  console.log("🔥 NEW OTP REGISTER CONTROLLER RUNNING");
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      
      return res.status(400).json({
        message: "User already exists",
      });
    }

    // Generate 6-digit OTP
    const verificationOTP = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    // OTP expires in 10 minutes
    const verificationOTPExpire = new Date(
      Date.now() + 10 * 60 * 1000
    );

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      verificationOTP,
      verificationOTPExpire,
    });
    console.log("🔥 OTP:", verificationOTP);
    console.log("🔥 OTP EXPIRY:", verificationOTPExpire);

    await sendEmail({
      email: user.email,
      subject: "Verify Your Email - Au-social",
      message: `
Your emial is verfiey for au social:

${verificationOTP}

This OTP will expire in 10 minutes.

If you did not create this account, please ignore this email.
`,
    });

    res.status(201).json({
      success: true,
      message: "Registration successful. Please verify your email using the OTP sent to your email.",
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        message: "Email already verified",
      });
    }

    if (
      user.verificationOTP !== otp ||
      !user.verificationOTPExpire ||
      user.verificationOTPExpire < new Date()
    ) {
      return res.status(400).json({
        message: "Invalid or expired OTP",
      });
    }

    user.isVerified = true;
    user.verificationOTP = undefined;
    user.verificationOTPExpire = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }
    if (!user.isVerified) {
      return res.status(401).json({
        message:
          "Please verify your email first"
      });
    }


    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }


    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "No account found with this email",
      });
    }

    const resetToken = crypto
      .randomBytes(32)
      .toString("hex");

    user.resetPasswordToken = resetToken;

    user.resetPasswordExpire =
      Date.now() + 10 * 60 * 1000;

    await user.save();
    const resetUrl =
      `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    const message = `
You requested a password reset.

Click the link below:

${resetUrl}

This link expires in 10 minutes.
`;

    await sendEmail({
      email: user.email,
      subject: "Password Reset",
      message,
    });

    res.status(200).json({
      success: true,
      message: "Reset token generated",
      resetToken,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};




const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: {
        $gt: Date.now(),
      },
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired token",
      });
    }

    const hashedPassword =
      await bcrypt.hash(password, 10);

    user.password = hashedPassword;

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successful",
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


module.exports = { register, login,verifyEmail, forgotPassword, resetPassword };