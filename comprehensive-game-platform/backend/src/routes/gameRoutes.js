const express = require("express");
const auth = require("../middleware/auth");

const router = express.Router();

// Example protected route
router.get("/", auth, (req, res) => {
  res.json({ message: `Hello User ${req.user}, welcome to the games API 🎮` });
});

module.exports = router;
