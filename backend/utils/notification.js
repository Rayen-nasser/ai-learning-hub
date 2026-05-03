const notificationModel = require("../models/notification.model");

/**
 * Create an in-app notification for a user
 * @param {Object} options
 * @param {string} options.userId - Target user ID
 * @param {string} options.type - Notification type enum
 * @param {string} options.title - Notification title
 * @param {string} options.message - Notification message body
 * @param {string} [options.relatedId] - Related object ID
 * @param {string} [options.relatedModel] - Related object model name
 */
const createNotification = async ({ userId, type, title, message, relatedId, relatedModel }) => {
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

/**
 * Notify all admins
 */
const notifyAdmins = async ({ type, title, message, relatedId, relatedModel }) => {
  try {
    const userModel = require("../models/user.model");
    const admins = await userModel.find({ role: 'admin' }).select('_id');
    
    const promises = admins.map(admin => 
      createNotification({ userId: admin._id, type, title, message, relatedId, relatedModel })
    );
    
    await Promise.all(promises);
  } catch (error) {
    console.error("Error notifying admins:", error.message);
  }
};

module.exports = {
  createNotification,
  notifyAdmins
};
