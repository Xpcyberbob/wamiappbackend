require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Test route
app.get("/", (req, res) => {
  res.send("Backend Wami OK 🚀");
});

// GET servo status
app.get("/servo/status", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM servo_state WHERE id = 1");
    res.json(result.rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "servo_status_failed" });
  }
});

// POST start servo
app.post("/servo/start", async (req, res) => {
  try {
    await pool.query(
      "UPDATE servo_state SET is_active = TRUE, updated_at = NOW() WHERE id = 1"
    );
    res.json({ message: "Servo started" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "servo_start_failed" });
  }
});

// POST stop servo
app.post("/servo/stop", async (req, res) => {
  try {
    await pool.query(
      "UPDATE servo_state SET is_active = FALSE, updated_at = NOW() WHERE id = 1"
    );
    res.json({ message: "Servo stopped" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "servo_stop_failed" });
  }
});

// POST temperature
app.post("/temperature", async (req, res) => {
  try {
    const { deviceId, tempC } = req.body;

    if (!deviceId || typeof tempC !== "number") {
      return res.status(400).json({ error: "deviceId and tempC required" });
    }

    await pool.query(
      "INSERT INTO temperatures (device_id, temp_c) VALUES ($1, $2)",
      [deviceId, tempC]
    );

    res.json({ message: "Temperature saved" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "temperature_save_failed" });
  }
});

// ✅ GET temperature history
// Exemple : /temperature/history?deviceId=esp32-001&limit=50
app.get("/temperature/history", async (req, res) => {
  try {
    const deviceId = (req.query.deviceId || "esp32-001").toString();
    const limit = Math.min(parseInt(req.query.limit || "50", 10), 500);

    const result = await pool.query(
      "SELECT temp_c, created_at FROM temperatures WHERE device_id=$1 ORDER BY created_at DESC LIMIT $2",
      [deviceId, limit]
    );

    res.json(result.rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "temperature_history_failed" });
  }
});

// ✅ GET latest temperature (optionnel)
// Exemple : /temperature/latest?deviceId=esp32-001
app.get("/temperature/latest", async (req, res) => {
  try {
    const deviceId = (req.query.deviceId || "esp32-001").toString();

    const result = await pool.query(
      "SELECT temp_c, created_at FROM temperatures WHERE device_id=$1 ORDER BY created_at DESC LIMIT 1",
      [deviceId]
    );

    res.json(result.rows[0] || null);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "temperature_latest_failed" });
  }
});

app.listen(process.env.PORT, "0.0.0.0", () => {
  console.log("Server running on http://localhost:" + process.env.PORT);
});
