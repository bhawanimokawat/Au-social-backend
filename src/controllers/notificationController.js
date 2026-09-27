const Notification = require("../models/Notification");

const getMyNotifications = async (req, res) => {
  try {
    const userId = req.user.userId;

    const notifications = await Notification.find({
      recipient: userId,
    })
      .populate("sender", "name profilePicture")
      .sort({ createdAt: -1 });

    const unreadNotifications = notifications.filter(
      (notification) => !notification.isRead
    ).length;

    return res.status(200).json({
      success: true,
      message: "Notifications fetched successfully",
      totalNotifications: notifications.length,
      unreadNotifications,
      notifications,
    });
  } catch (error) {
    console.error("Get notifications error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.userId;

    // Find notification
    const notification = await Notification.findById(notificationId);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    // Only recipient can mark notification as read
    if (notification.recipient.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this notification",
      });
    }

    // Check if already read
    if (notification.isRead) {
      return res.status(400).json({
        success: false,
        message: "Notification is already marked as read",
      });
    }

    notification.isRead = true;

    await notification.save();

    return res.status(200).json({
      success: true,
      message: "Notification marked as read",
      notification,
    });
  } catch (error) {
    console.error("Mark notification as read error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await Notification.updateMany(
      {
        recipient: userId,
        isRead: false,
      },
      {
        $set: {
          isRead: true,
        },
      }
    );

    return res.status(200).json({
      success: true,
      message: "All notifications marked as read",
      updatedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error(
      "Mark all notifications as read error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.userId;

    // Find notification
    const notification = await Notification.findById(notificationId);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    // Only recipient can delete notification
    if (notification.recipient.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this notification",
      });
    }

    // Delete notification
    await Notification.findByIdAndDelete(notificationId);

    return res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    console.error("Delete notification error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  getMyNotifications, markNotificationAsRead,markAllNotificationsAsRead,deleteNotification};