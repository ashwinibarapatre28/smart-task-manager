const express = require("express");
const cors = require("cors");

const userRoutes = require("./src/routes/users");
const taskRoutes = require("./src/routes/tasks");

const app = express();

const PORT = 5000;

// ==================== MIDDLEWARE ====================

app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001"],
  })
);

app.use(express.json());

// ==================== ROUTES ====================

app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);

// ==================== HEALTH CHECK ====================

app.get("/", (req, res) => {
  res.json({
    message: "TaskFlow backend is running",
  });
});

// ==================== 404 HANDLER ====================

app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
  });
});

// ==================== START SERVER ====================

app.listen(PORT, () => {
  console.log(`TaskFlow backend running on http://localhost:${PORT}`);
});