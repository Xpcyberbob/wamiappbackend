require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

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

// Debug route - test DB + create tables if missing
app.get("/debug/init", async (req, res) => {
  try {
    // Test connexion
    const timeResult = await pool.query("SELECT NOW() as time");
    
    // Créer la table servo_state si elle n'existe pas
    await pool.query(`
      CREATE TABLE IF NOT EXISTS servo_state (
        id SERIAL PRIMARY KEY,
        is_active BOOLEAN DEFAULT FALSE,
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    // Insérer la ligne par défaut si vide
    const servoCheck = await pool.query("SELECT COUNT(*) FROM servo_state");
    if (parseInt(servoCheck.rows[0].count) === 0) {
      await pool.query("INSERT INTO servo_state (id, is_active) VALUES (1, FALSE)");
    }
    
    // Créer la table temperatures si elle n'existe pas
    await pool.query(`
      CREATE TABLE IF NOT EXISTS temperatures (
        id SERIAL PRIMARY KEY,
        device_id TEXT NOT NULL,
        temp_c NUMERIC NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    res.json({ 
      ok: true, 
      time: timeResult.rows[0].time,
      message: "Tables created/verified successfully"
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
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
