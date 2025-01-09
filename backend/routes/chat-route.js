const express = require("express");
const chatRouter = express.Router();
const Chat = require("../models/chatModel");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

// Create a new chat

chatRouter.post("/", authMiddleware, async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    console.log("UserId param not sent with request");
    return res.sendStatus(400);
  }

  var isChat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: req.user._id } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate("users", "-password")
    .populate("latestMessage");

  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "name profilePic email",
  });

  if (isChat.length > 0) {
    res.send(isChat[0]);
  } else {
    var chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.user._id, userId],
    };

    try {
      const createdChat = await Chat.create(chatData);
      const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "users",
        "-password"
      );
      res.status(200).json(FullChat);
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
  }
});

chatRouter.get("/", authMiddleware, async (req, res) => {
  try {
    Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 })
      .then(async (results) => {
        results = await User.populate(results, {
          path: "latestMessage.sender",
          select: "name pic email",
        });
        res.status(200).send(results);
      });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});
chatRouter.post("/group-chat", authMiddleware, async (req, res) => {
  if (!req.body.users || !req.body.name) {
    return res.status(400).send({ message: "Please Fill all the fields" });
  }

  // Since users are now an array, no need to parse it
  var users = req.body.users;

  if (users.length < 2) {
    return res
      .status(400)
      .send("More than 2 users are required to form a group chat");
  }

  // Add the logged-in user to the users array
  users.push(req.user._id);

  try {
    const groupChat = await Chat.create({
      chatName: req.body.name,
      users: users,
      isGroupChat: true,
      groupAdmin: req.user._id, // Storing the logged-in user as the group admin
    });

    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res.status(200).json(fullGroupChat);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

// chatRouter.post("/", authMiddleware, async (req, res) => {
//   const { userId } = req.body;
//   try {
//     const newChat = new Chat({
//       userId,
//     });
//     await newChat.save();
//     res.status(201).json(newChat);
//   } catch (error) {
//     res.status(500).json({ error: "Failed to create chat" });
//   }
// });

// chatRouter.post("/create", authMiddleware, async (req, res) => {
//   const { chatName, chatImage, chatAdmin, chatUsers } = req.body;

//   try {
//     const newChat = new Chat({
//       chatName,
//       chatImage,
//       chatAdmin,
//       chatUsers,
//     });

//     await newChat.save();
//     res.status(201).json(newChat);
//   } catch (error) {
//     res.status(500).json({ error: "Failed to create chat" });
//   }
// });

// chatRouter.get("/fetch/:userId", authMiddleware, async (req, res) => {
//   const { userId } = req.params;

//   try {
//     const chats = await Chat.find({ chatUsers: userId })
//       .populate("chatUsers", "username email")
//       .populate("chatAdmin", "username email")
//       .populate("latestMsg")
//       .sort({ updatedAt: -1 });

//     res.status(200).json(chats);
//   } catch (error) {
//     res.status(500).json({ error: "Failed to fetch chats" });
//   }
// });

// chatRouter.post("/add-user", authMiddleware, async (req, res) => {
//   const { chatId, userId } = req.body;

//   try {
//     const chat = await Chat.findByIdAndUpdate(
//       chatId,
//       { $addToSet: { chatUsers: userId } },
//       { new: true }
//     ).populate("chatUsers", "username email");

//     res.status(200).json(chat);
//   } catch (error) {
//     res.status(500).json({ error: "Failed to add user to chat" });
//   }
// });

// chatRouter.post("/remove-user", authMiddleware, async (req, res) => {
//   const { chatId, userId } = req.body;

//   try {
//     const chat = await Chat.findByIdAndUpdate(
//       chatId,
//       { $pull: { chatUsers: userId } },
//       { new: true }
//     ).populate("chatUsers", "username email");

//     res.status(200).json(chat);
//   } catch (error) {
//     res.status(500).json({ error: "Failed to remove user from chat" });
//   }
// });

// chatRouter.post("/send-message", authMiddleware, async (req, res) => {
//   const { chatId, message, sender } = req.body;

//   try {
//     const newMessage = {
//       message,
//       sender,
//       timestamp: Date.now(),
//     };

//     const chat = await Chat.findByIdAndUpdate(
//       chatId,
//       {
//         $push: { chatMessages: newMessage },
//         latestMessage: newMessage,
//       },
//       { new: true }
//     ).populate("chatUsers", "username email");

//     res.status(200).json(chat);
//   } catch (error) {
//     res.status(500).json({ error: "Failed to send message" });
//   }
// });

// // Fetch all messages from a chat
// const fetchChatMessages = async (req, res) => {
//   const { chatId } = req.params;

//   try {
//     const chat = await Chat.findById(chatId)
//       .populate("chatMessages.sender", "username email")
//       .populate("chatUsers", "username email");

//     if (!chat) {
//       return res.status(404).json({ error: "Chat not found" });
//     }

//     res.status(200).json(chat.chatMessages);
//   } catch (error) {
//     res.status(500).json({ error: "Failed to fetch messages" });
//   }
// };
// chatRouter.get("/fetch-messages/:chatId", authMiddleware, fetchChatMessages);
module.exports = chatRouter;
