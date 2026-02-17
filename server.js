require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const { EdgeTTS } = require("@andresaya/edge-tts");

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

// Debug route - test DB connection and show env info
app.get("/debug/init", async (req, res) => {
  const dbUrl = process.env.DATABASE_URL;
  const info = {
    hasDbUrl: !!dbUrl,
    dbUrlPrefix: dbUrl ? dbUrl.substring(0, 30) + "..." : "NOT SET",
    port: process.env.PORT,
    nodeEnv: process.env.NODE_ENV,
  };

  try {
    const timeResult = await pool.query("SELECT NOW() as time");
    
    // Vérifier si servo_state existe et a des données
    let servoInfo = "unknown";
    try {
      const servoCheck = await pool.query("SELECT COUNT(*) as cnt FROM servo_state");
      servoInfo = "exists, rows=" + servoCheck.rows[0].cnt;
      if (parseInt(servoCheck.rows[0].cnt) === 0) {
        await pool.query("INSERT INTO servo_state (id, is_active) VALUES (1, FALSE)");
        servoInfo += " -> inserted default row";
      }
    } catch (e) {
      servoInfo = "error: " + e.message;
    }

    // Vérifier temperatures
    let tempInfo = "unknown";
    try {
      const tempCheck = await pool.query("SELECT COUNT(*) as cnt FROM temperatures");
      tempInfo = "exists, rows=" + tempCheck.rows[0].cnt;
    } catch (e) {
      tempInfo = "error: " + e.message;
    }

    res.json({ 
      ok: true, 
      time: timeResult.rows[0].time,
      env: info,
      servo_state: servoInfo,
      temperatures: tempInfo,
    });
  } catch (err) {
    res.status(500).json({ 
      ok: false, 
      error: err.message,
      stack: err.stack,
      env: info,
    });
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

// ============================================================
// 🎤 TTS - Edge TTS (Microsoft) - Voix réalistes et naturelles
// ============================================================

// Mapping des langues vers les voix Microsoft Edge
const EDGE_TTS_VOICES = {
  fr: { voice: "fr-FR-DeniseNeural", lang: "fr-FR" },
  en: { voice: "en-US-JennyNeural", lang: "en-US" },
  ar: { voice: "ar-SA-ZariyahNeural", lang: "ar-SA" },
  sw: { voice: "sw-KE-ZuriNeural", lang: "sw-KE" },
  ha: null,      // Pas de voix Edge pour Hausa → fallback MMS
  bci: null,     // Pas de voix Edge pour Baoulé → fallback MMS
  malinke: null, // Pas de voix Edge pour Malinké → fallback MMS
};

// Fallback vers Hugging Face MMS pour les langues non supportées par Edge
const MMS_MODELS = {
  fr: "facebook/mms-tts-fra",
  en: "facebook/mms-tts-eng",
  bci: "facebook/mms-tts-bci",
  ar: "facebook/mms-tts-ara",
  sw: "facebook/mms-tts-swh",
  ha: "facebook/mms-tts-hau",
  malinke: "facebook/mms-tts-fra", // fallback français
};

// POST /tts/speak - Synthèse vocale réaliste
app.post("/tts/speak", async (req, res) => {
  const { text, language } = req.body;

  if (!text || !text.trim()) {
    return res.status(400).json({ error: "text is required" });
  }

  const lang = language || "fr";
  const edgeVoice = EDGE_TTS_VOICES[lang];

  // Si Edge TTS supporte cette langue, l'utiliser (voix réaliste)
  if (edgeVoice) {
    try {
      const tts = new EdgeTTS();

      await tts.synthesize(text.trim(), edgeVoice.voice, {
        outputFormat: "audio-24khz-48kbitrate-mono-mp3",
      });

      const audioBuffer = tts.toBuffer();

      res.set({
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.length,
      });
      res.send(audioBuffer);

      console.log(`🎤 Edge TTS [${lang}/${edgeVoice.voice}]: ${text.substring(0, 50)}... (${(audioBuffer.length / 1024).toFixed(1)} KB)`);
    } catch (error) {
      console.error("❌ Edge TTS Error:", error.message);
      // Fallback vers MMS si Edge échoue
      try {
        const audioBuffer = await generateMmsAudio(text, lang);
        res.set({ "Content-Type": "audio/wav" });
        res.send(audioBuffer);
      } catch (mmsError) {
        console.error("❌ MMS Fallback Error:", mmsError.message);
        res.status(500).json({ error: "tts_failed", details: error.message });
      }
    }
  } else {
    // Langues non supportées par Edge → utiliser MMS (Hugging Face)
    try {
      const audioBuffer = await generateMmsAudio(text, lang);
      res.set({ "Content-Type": "audio/wav" });
      res.send(audioBuffer);
      console.log(`🎤 MMS TTS [${lang}]: ${text.substring(0, 50)}... (${(audioBuffer.length / 1024).toFixed(1)} KB)`);
    } catch (error) {
      console.error("❌ MMS TTS Error:", error.message);
      res.status(500).json({ error: "tts_failed", details: error.message });
    }
  }
});

// Génère l'audio via Hugging Face MMS (pour langues africaines)
async function generateMmsAudio(text, languageCode) {
  const model = MMS_MODELS[languageCode] || MMS_MODELS.fr;
  const hfKey = process.env.HF_API_KEY;

  const response = await fetch(
    `https://api-inference.huggingface.co/models/${model}`,
    {
      method: "POST",
      headers: {
        Authorization: hfKey ? `Bearer ${hfKey}` : undefined,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: text }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HF API Error (${response.status}): ${errorText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// GET /tts/voices - Liste les voix disponibles
app.get("/tts/voices", (req, res) => {
  const voices = Object.entries(EDGE_TTS_VOICES)
    .filter(([, v]) => v !== null)
    .map(([lang, v]) => ({ language: lang, voice: v.voice, engine: "edge" }));

  const mmsVoices = Object.entries(MMS_MODELS).map(([lang, model]) => ({
    language: lang,
    model,
    engine: "mms",
  }));

  res.json({ edge: voices, mms: mmsVoices });
});

app.listen(process.env.PORT, "0.0.0.0", () => {
  console.log("Server running on http://localhost:" + process.env.PORT);
});
