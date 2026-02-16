require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const { z } = require("zod");

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Test route
app.get("/", (req, res) => {
  res.send("Backend Wami OK 🚀");
});

// Debug route - test DB connection
app.get("/debug/db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW() as time");
    res.json({ ok: true, time: result.rows[0].time });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// GET servo status
app.get("/servo/status", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM servo_state WHERE id = 1");
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Servo state not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("GET /servo/status error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST start servo
app.post("/servo/start", async (req, res) => {
  try {
    await pool.query("UPDATE servo_state SET is_active = TRUE, updated_at = NOW() WHERE id = 1");
    res.json({ message: "Servo started", is_active: true });
  } catch (err) {
    console.error("POST /servo/start error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST stop servo
app.post("/servo/stop", async (req, res) => {
  try {
    await pool.query("UPDATE servo_state SET is_active = FALSE, updated_at = NOW() WHERE id = 1");
    res.json({ message: "Servo stopped", is_active: false });
  } catch (err) {
    console.error("POST /servo/stop error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Validation schema for temperature
const temperatureSchema = z.object({
  deviceId: z.string().min(1),
  tempC: z.number().min(-50).max(100),
});

// POST temperature
app.post("/temperature", async (req, res) => {
  try {
    const parsed = temperatureSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid data", details: parsed.error.issues });
    }

    const { deviceId, tempC } = parsed.data;
    await pool.query(
      "INSERT INTO temperatures (device_id, temp_c) VALUES ($1, $2)",
      [deviceId, tempC]
    );

    res.json({ message: "Temperature saved" });
  } catch (err) {
    console.error("POST /temperature error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET latest temperatures
app.get("/temperature/latest", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM temperatures ORDER BY created_at DESC LIMIT 10"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("GET /temperature/latest error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(process.env.PORT, "0.0.0.0", () => {
  console.log("Server running on http://localhost:" + process.env.PORT);
});
