const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const { getMyNotifications,markNotificationAsRead,markAllNotificationsAsRead,deleteNotification} = require("../controllers/notificationController");

router.get("/",  authMiddleware,  getMyNotifications);
router.put("/:notificationId/read",  authMiddleware,markNotificationAsRead);
router.put( "/read-all", authMiddleware, markAllNotificationsAsRead);
router.delete("/:notificationId",authMiddleware,deleteNotification);



module.exports = router;