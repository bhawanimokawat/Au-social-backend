const express = require("express");
//const { registerUser,loginUser } = require("../controllers/authController");
const { register, login,verifyEmail, forgotPassword, resetPassword } = require("../controllers/authController1")


const router = express.Router();

//router.post("/register", registerUser);
//router.post("/login",loginUser);

router.post("/register",register);
router.post("/login",login);
router.post("/forget-password", forgotPassword);
router.patch("/reset-password/:token", resetPassword);

// OTP verification
router.post("/verify-email", verifyEmail);


 

module.exports = router;