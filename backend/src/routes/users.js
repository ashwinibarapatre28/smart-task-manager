const express = require("express");
const { users } = require("../data/store");

const router = express.Router();

// ==================== GET ALL USERS ====================

router.get("/", (req, res) => {
  const userList = Array.from(users.values()).map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
  }));

  res.json(userList);
});

// ==================== GET USER BY ID ====================

router.get("/:id", (req, res) => {
  const user = users.get(req.params.id);

  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
  });
});

// ==================== CREATE USER ====================

router.post("/", (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      message: "Name, email and password are required",
    });
  }

  const cleanName = name.trim();
  const cleanEmail = email.trim().toLowerCase();

  const existingUser = Array.from(users.values()).find(
    (user) => user.email.toLowerCase() === cleanEmail
  );

  if (existingUser) {
    return res.status(409).json({
      message: "A user with this email already exists",
    });
  }

  // ==================== GENERATE SEQUENTIAL USER ID ====================

  const existingUserNumbers = Array.from(users.keys())
    .map((id) => {
      const match = id.match(/^user-(\d+)$/);
      return match ? Number(match[1]) : 0;
    });

  const nextUserNumber =
    Math.max(0, ...existingUserNumbers) + 1;

  const userId = `user-${nextUserNumber}`;

  // ==================== CREATE USER ====================

  const newUser = {
    id: userId,
    name: cleanName,
    email: cleanEmail,
    password,
  };

  users.set(userId, newUser);

  res.status(201).json({
    message: "User created successfully",
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
    },
  });
});

// ==================== LOGIN ====================

router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Email and password are required",
    });
  }

  const cleanEmail = email.trim().toLowerCase();

  const user = Array.from(users.values()).find(
    (item) => item.email.toLowerCase() === cleanEmail
  );

  if (!user || user.password !== password) {
    return res.status(401).json({
      message: "Invalid email or password",
    });
  }

  res.json({
    message: "Login successful",
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  });
});

module.exports = router;