require("dotenv").config();
const express = require("express");
const app = express();

const connectDB = require("./connection/ConnectDB");
const router = require("./routes/user-route");
const cors = require("cors");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const messageRouter = require("./routes/message-route");
const chatRouter = require("./routes/chat-route.js");
const PORT = process.env.PORT || 5001;

connectDB();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());

app.use(
  cors({
    origin: "http://localhost:3000", // Replace with your frontend URL
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"], // Allow all the required methods
    credentials: true, // Enable credentials (cookies, authorization headers)
  })
);

app.use("/api/user", router);
app.use("/api/chat", chatRouter);

app.use("/api/message", messageRouter);

app.use(notFound);
app.use(errorHandler);

const server = app.listen(PORT, () => {
  console.log("Server is running on port", PORT);
});

const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});
io.on("connect", (socket) => {
  console.log("Connected to socket.io");

  socket.on("setup", (user) => {
    if (!user || !user._id) {
      console.error("Invalid user data");
      return;
    }
    socket.join(user._id);
    socket.emit("connected");
    console.log(`User ${user._id} connected and joined their room`);
  });

  socket.on("join chat", (room) => {
    if (!room) {
      console.error("Room ID is required to join chat");
      return;
    }
    socket.join(room);
    console.log("User joined room:", room);
  });

  socket.on("typing", (room) => {
    if (room) socket.to(room).emit("typing");
  });

  socket.on("stop typing", (room) => {
    if (room) socket.to(room).emit("stop typing");
  });

  socket.on("send message", (newMessage) => {
    const chat = newMessage.chat;
    if (!chat || !chat.users) {
      console.error("Chat or users not defined in message");
      return;
    }

    chat.users.forEach((user) => {
      if (user._id !== newMessage.sender._id) {
        socket.to(user._id).emit("message received", newMessage);
      }
    });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});
