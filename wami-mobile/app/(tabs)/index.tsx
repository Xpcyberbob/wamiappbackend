import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

const BASE_URL = "https://wamiappbackend.onrender.com";

export default function HomeScreen() {
  const [isActive, setIsActive] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  async function refreshStatus() {
    try {
      const r = await fetch(`${BASE_URL}/servo/status`);
      const data = await r.json();
      setIsActive(!!data.is_active);
    } catch (e) {
      console.log(e);
    }
  }

  async function startServo() {
    setLoading(true);
    try {
      console.log("📡 Envoi POST /servo/start...");
      const r = await fetch(`${BASE_URL}/servo/start`, { method: "POST" });
      const data = await r.json();
      console.log("✅ Réponse start:", r.status, data);
      await refreshStatus();
    } catch (e) {
      console.error("❌ Erreur startServo:", e);
    } finally {
      setLoading(false);
    }
  }

  async function stopServo() {
    setLoading(true);
    try {
      console.log("📡 Envoi POST /servo/stop...");
      const r = await fetch(`${BASE_URL}/servo/stop`, { method: "POST" });
      const data = await r.json();
      console.log("✅ Réponse stop:", r.status, data);
      await refreshStatus();
    } catch (e) {
      console.error("❌ Erreur stopServo:", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshStatus();
    const t = setInterval(refreshStatus, 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>WAMI Control</Text>

      <Text style={styles.status}>
        Servo: <Text style={{ fontWeight: "700" }}>{isActive ? "ON" : "OFF"}</Text>
      </Text>

      <Pressable
        style={[styles.btn, { opacity: loading ? 0.5 : 1 }]}
        onPress={startServo}
        disabled={loading}
      >
        <Text style={styles.btnText}>Activer Servo</Text>
      </Pressable>

      <Pressable
        style={[styles.btn, styles.btnStop, { opacity: loading ? 0.5 : 1 }]}
        onPress={stopServo}
        disabled={loading}
      >
        <Text style={styles.btnText}>Désactiver Servo</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 20,
  },
  status: {
    fontSize: 18,
    marginBottom: 20,
  },
  btn: {
    width: "100%",
    padding: 14,
    borderRadius: 10,
    backgroundColor: "#111",
    marginBottom: 12,
  },
  btnStop: {
    backgroundColor: "#444",
  },
  btnText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
});
