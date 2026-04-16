const notificationModel = require("../models/notification.model");
const { sendSuccess, sendError } = require("../utils/response");

module.exports.createNotification = async ({ userId, type, title, message, relatedId, relatedModel, emailData }) => {
  try {
    const notification = new notificationModel({
      userId,
      type,
      title,
      message,
      relatedId,
      relatedModel,
    });
    await notification.save();
    return notification;
  } catch (error) {
    console.error("Error creating notification:", error.message);
    return null;
  }
};

module.exports.getMyNotifications = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const unreadOnly = req.query.unread === "true";

    const query = { userId: req.user._id };
    if (unreadOnly) {
      query.read = false;
    }

    const [notifications, total] = await Promise.all([
      notificationModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      notificationModel.countDocuments(query),
    ]);

    const unreadCount = await notificationModel.countDocuments({ userId: req.user._id, read: false });

    return sendSuccess(res, {
      notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      unreadCount,
    }, "Notifications retrieved successfully");
  } catch (error) {
    return sendError(res, error.message);
  }
};

module.exports.getUnreadCount = async (req, res) => {
  try {
    const count = await notificationModel.countDocuments({ userId: req.user._id, read: false });
    return sendSuccess(res, { count }, "Unread count retrieved successfully");
  } catch (error) {
    return sendError(res, error.message);
  }
};

module.exports.markAsRead = async (req, res) => {
  try {
    const notification = await notificationModel.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return sendError(res, "Notification not found", 404);
    }

    return sendSuccess(res, notification, "Notification marked as read");
  } catch (error) {
    return sendError(res, error.message);
  }
};

module.exports.markAllAsRead = async (req, res) => {
  try {
    await notificationModel.updateMany(
      { userId: req.user._id, read: false },
      { read: true }
    );

    return sendSuccess(res, null, "All notifications marked as read");
  } catch (error) {
    return sendError(res, error.message);
  }
};

module.exports.deleteNotification = async (req, res) => {
  try {
    const notification = await notificationModel.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!notification) {
      return sendError(res, "Notification not found", 404);
    }

    return sendSuccess(res, null, "Notification deleted successfully");
  } catch (error) {
    return sendError(res, error.message);
  }
};

module.exports.deleteAllNotifications = async (req, res) => {
  try {
    await notificationModel.deleteMany({ userId: req.user._id });
    return sendSuccess(res, null, "All notifications deleted successfully");
  } catch (error) {
    return sendError(res, error.message);
  }
};
