const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");

const authMiddleware = require("../middleware/authMiddleware");

// Register User
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  console.log("Incoming data:", req.body); // Log incoming data

  if (!name || !email || !password) {
    return res.status(400).json({ msg: "Please enter all fields" });
  }

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ msg: "User already exists" });
    }

    // Create new user instance
    const user = new User({
      name,
      email,
      password, // This will trigger password hashing in User model
    });

    const newUser = await user.save();
    console.log("User created:", newUser);

    // Respond with user info & token
    if (newUser) {
      res.status(201).json({
        message: "User created successfully",
      });
    }
  } catch (error) {
    console.error("Error during registration:", error.message);
    res.status(500).send("Server Error");
  }
});

// Login User
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  console.log("Incoming login data:", req.body);

  if (!email || !password) {
    return res.status(400).json({ msg: "Please enter all fields" });
  }

  try {
    const user = await User.findOne({ email });
    console.log("User found:", user);

    if (!user) {
      return res.status(400).json({ msg: "User does not exist" });
    }

    // Compare entered password with hashed password
    const isMatch = await user.matchPassword(password);
    console.log("Password match result:", isMatch);

    if (isMatch) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: await user.generateToken(),
      });
    } else {
      return res.status(400).json({ msg: "Invalid credentials" });
    }
  } catch (error) {
    console.error("Error during login:", error.message);
    res.status(500).send("Server Error");
  }
});

router.get("/allUsers", authMiddleware, async (req, res) => {
  try {
    // Fetch all users from the database
    const users = await User.find().select("name email avatar"); // Select only the fields you need

    if (!users) {
      return res.status(404).json({ message: "No users found" });
    }

    res.json(users); // Return the list of users
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/currentUser", authMiddleware, async (req, res) => {
  try {
    const userData = await req.user;
    console.log(userData);
    return res.status(200).json({ userData });
  } catch (error) {
    console.log(`error from server ${error}`);
  }
});

router.get("/users", authMiddleware, async (req, res) => {
  const keyword = req.query.search
    ? {
        name: {
          $regex: req.query.search,
          $options: "i",
        },
        email: {
          $regex: req.query.search,
          $options: "i",
        },
      }
    : {};

  const users = await User.find(keyword).find({
    _id: { $ne: req.user._id },
  });
  res.send(users);
});

router.get("/:id", authMiddleware, async (req, res, next) => {
  try {
    const id = req.params.id;
    const getUser = await User.findOne({ _id: id });
    res.status(200).json({ getUser });
  } catch (error) {
    next(error);
  }
});

router.patch("/update-pass/:id", authMiddleware, async (req, res, next) => {
  // Changed to POST method
  try {
    const id = req.params.id;
    const { password } = req.body; // Assuming password is sent in the request body

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const updatePass = await User.updateOne(
      { _id: id },
      { $set: { password: hashedPassword } }
    );

    res.status(200).json({ updatePass });
  } catch (error) {
    next(error);
  }
});

router.put("/profile/edit", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id; // Assume `protect` middleware adds `user` object to `req`
    const { name, email, profilePic } = req.body;

    // Validate input
    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required" });
    }

    // Find user in the database
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update user fields
    user.name = name || user.name;
    user.email = email || user.email;
    user.profilePic = profilePic || user.profilePic;

    // Save updated user
    const updatedUser = await user.save();

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        profilePic: updatedUser.profilePic,
      },
    });
  } catch (error) {
    console.error("Error updating profile:", error.message);
    res.status(500).json({ message: "Server error. Try again later." });
  }
});

module.exports = router;
