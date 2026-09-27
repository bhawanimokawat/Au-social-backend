const Connection = require("../models/connection");
const User = require("../models/user");
const Notification = require("../models/Notification")

const sendConnectionRequest = async (req, res) => {
  try {
    const senderId = req.user.userId;
    const { userId: receiverId } = req.params;

    // Cannot send request to yourself
    if (senderId.toString() === receiverId.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot send a connection request to yourself",
      });
    }

    // Check receiver exists
    const receiver = await User.findById(receiverId);

    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check existing connection in either direction
    const existingConnection = await Connection.findOne({
      $or: [
        {
          sender: senderId,
          receiver: receiverId,
        },
        {
          sender: receiverId,
          receiver: senderId,
        },
      ],
    });

    if (existingConnection) {
      if (existingConnection.status === "pending") {
        return res.status(400).json({
          success: false,
          message: "Connection request already exists",
        });
      }

      if (existingConnection.status === "accepted") {
        return res.status(400).json({
          success: false,
          message: "Users are already connected",
        });
      }

      if (existingConnection.status === "rejected") {
        return res.status(400).json({
          success: false,
          message: "Connection request was previously rejected",
        });
      }
    }

    // Create connection request
    const connection = await Connection.create({
      sender: senderId,
      receiver: receiverId,
      status: "pending",
    });

    // Get sender information
    const sender = await User.findById(senderId);

    // Create notification for receiver
    await Notification.create({
      recipient: receiverId,
      sender: senderId,
      type: "connection_request",
      message: `${sender.name} sent you a connection request`,
      relatedId: connection._id,
    });

    return res.status(201).json({
      success: true,
      message: "Connection request sent successfully",
      connection,
    });
  } catch (error) {
    console.error("Send connection request error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
const acceptConnectionRequest = async (req, res) => {
  try {
    const { connectionId } = req.params;
    const userId = req.user.userId;

    // Find the connection request
    const connection = await Connection.findById(connectionId);

    if (!connection) {
      return res.status(404).json({
        success: false,
        message: "Connection request not found",
      });
    }

    // Only receiver can accept the request
    if (connection.receiver.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to accept this request",
      });
    }

    // Request must be pending
    if (connection.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Connection request is no longer pending",
      });
    }

    // Accept request
    connection.status = "accepted";

    await connection.save();

    return res.status(200).json({
      success: true,
      message: "Connection request accepted successfully",
      connection,
    });
  } catch (error) {
    console.error("Accept connection request error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const rejectConnectionRequest = async (req, res) => {
  try {
    const { connectionId } = req.params;
    const userId = req.user.userId;

    // Find connection request
    const connection = await Connection.findById(connectionId);

    if (!connection) {
      return res.status(404).json({
        success: false,
        message: "Connection request not found",
      });
    }

    // Only receiver can reject the request
    if (connection.receiver.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to reject this request",
      });
    }

    // Request must be pending
    if (connection.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Connection request is no longer pending",
      });
    }

    // Reject request
    connection.status = "rejected";

    await connection.save();

    return res.status(200).json({
      success: true,
      message: "Connection request rejected successfully",
      connection,
    });
  } catch (error) {
    console.error("Reject connection request error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const cancelConnectionRequest = async (req, res) => {
  try {
    const { connectionId } = req.params;
    const userId = req.user.userId;

    // Find the connection request
    const connection = await Connection.findById(connectionId);

    if (!connection) {
      return res.status(404).json({
        success: false,
        message: "Connection request not found",
      });
    }

    // Only sender can cancel the request
    if (connection.sender.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to cancel this request",
      });
    }

    // Only pending requests can be cancelled
    if (connection.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending requests can be cancelled",
      });
    }

    // Delete connection request
    await Connection.findByIdAndDelete(connectionId);

    return res.status(200).json({
      success: true,
      message: "Connection request cancelled successfully",
    });
  } catch (error) {
    console.error("Cancel connection request error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const removeConnection = async (req, res) => {
  try {
    const { connectionId } = req.params;
    const userId = req.user.userId;

    // Find connection
    const connection = await Connection.findById(connectionId);

    if (!connection) {
      return res.status(404).json({
        success: false,
        message: "Connection not found",
      });
    }

    // Connection must be accepted
    if (connection.status !== "accepted") {
      return res.status(400).json({
        success: false,
        message: "Only accepted connections can be removed",
      });
    }

    // Check whether user belongs to this connection
    const isParticipant =
      connection.sender.toString() === userId.toString() ||
      connection.receiver.toString() === userId.toString();

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to remove this connection",
      });
    }

    // Remove connection
    await Connection.findByIdAndDelete(connectionId);

    return res.status(200).json({
      success: true,
      message: "Connection removed successfully",
    });
  } catch (error) {
    console.error("Remove connection error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const getMyConnections = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Find accepted connections where current user
    // is either sender or receiver
    const connections = await Connection.find({
      status: "accepted",
      $or: [
        { sender: userId },
        { receiver: userId },
      ],
    })
      .populate("sender", "name email role profilePicture")
      .populate("receiver", "name email role profilePicture")
      .sort({ updatedAt: -1 });

    // Return only the other user
    const formattedConnections = connections.map((connection) => {
      const connectedUser =
        connection.sender._id.toString() === userId.toString()
          ? connection.receiver
          : connection.sender;

      return {
        connectionId: connection._id,
        user: connectedUser,
        connectedAt: connection.updatedAt,
      };
    });

    return res.status(200).json({
      success: true,
      message: "Connections fetched successfully",
      totalConnections: formattedConnections.length,
      connections: formattedConnections,
    });
  } catch (error) {
    console.error("Get my connections error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const getPendingRequests = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Find pending requests received by the logged-in user
    const requests = await Connection.find({
      receiver: userId,
      status: "pending",
    })
      .populate("sender", "name email role profilePicture")
      .sort({ createdAt: -1 });

    const formattedRequests = requests.map((request) => ({
      connectionId: request._id,
      sender: request.sender,
      sentAt: request.createdAt,
    }));

    return res.status(200).json({
      success: true,
      message: "Pending requests fetched successfully",
      totalRequests: formattedRequests.length,
      requests: formattedRequests,
    });
  } catch (error) {
    console.error("Get pending requests error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  sendConnectionRequest, acceptConnectionRequest, rejectConnectionRequest,cancelConnectionRequest,removeConnection,getMyConnections,
  getPendingRequests
};