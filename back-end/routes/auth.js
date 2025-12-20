const express = require("express");
const router = express.Router();
const db = require("../db");

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    // Sesuaikan query dengan tabel users yang kamu buat di database whadventure
    const [rows] = await db.query(
      "SELECT * FROM users WHERE username = ? AND password = ?",
      [username, password]
    );

    if (rows.length > 0) {
      res.json({ 
        success: true, 
        message: "Login berhasil",
        user: { id: rows[0].id, username: rows[0].username } 
      });
    } else {
      res.status(401).json({ success: false, message: "Username atau password salah" });
    }
  } catch (err) {
    console.error("Auth Error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

module.exports = router;