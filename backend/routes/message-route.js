const express = require("express");
const messageRouter = express.Router();
const Message = require("../models/messageModel");
const Chat = require("../models/chatModel");
const User = require("../models/User");

const authMiddleware = require("../middleware/authMiddleware");

messageRouter.post("/send", authMiddleware, async (req, res) => {
  const { message, chatId } = req.body;

  if (!message || !chatId) {
    console.log("Invalid data");
    return res.status(400).json({ error: "Message and chatId are required." });
  }

  let newMessage = {
    sender: req.user._id,
    message: message,
    chat: chatId,
  };

  try {
    let content = await Message.create(newMessage);
    content = await content.populate("sender", "name pic");
    content = await content.populate("chat");
    content = await User.populate(content, {
      path: "chat.users",
      select: "name pic email",
    });

    await Chat.findByIdAndUpdate(req.body.chatId, {
      latestMessage: content,
    });

    res.json(content);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

messageRouter.get("/all/:chatId", authMiddleware, async (req, res) => {
  const { chatId } = req.params;

  try {
    const messages = await Message.find({ chat: chatId })
      .populate("sender", "name pic email")
      .populate("chat");

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

messageRouter.delete("/delete/:messageId", authMiddleware, async (req, res) => {
  const { messageId } = req.params;

  try {
    const deletedMessage = await Message.findById(messageId);

    if (!deletedMessage) {
      return res.status(404).json({ error: "Message not found" });
    }

    if (deletedMessage.sender.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ error: "Not authorized to delete this message." });
    }

    await deletedMessage.deleteOne();

    await Chat.findByIdAndUpdate(deletedMessage.chat, {
      $pull: { chatMessages: messageId },
    });

    res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete message" });
  }
});

module.exports = messageRouter;
