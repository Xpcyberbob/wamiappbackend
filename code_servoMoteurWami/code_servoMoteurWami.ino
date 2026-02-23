#include <WiFi.h>
#include <HTTPClient.h>
#include <ESP32Servo.h>

/* =========================
   CONFIG WIFI + BACKEND
   ⚠️ Modifier ssid/password selon votre réseau WiFi
   ⚠️ Modifier baseUrl quand le backend sera hébergé en ligne
========================= */
const char* ssid = "Galaxy A54 5G D195";
const char* password = "dominique2024a";

// Backend local (PC sur le même réseau WiFi) :
// const char* baseUrl = "http://10.98.145.242:3000";
// Backend hébergé sur Render :
const char* baseUrl = "https://wamiappbackend.onrender.com";

/* =========================
   SERVO (LOGIQUE 0° <-> 90°)
   progressif + pause 500ms
========================= */
Servo monServo;
const int servoPin = 13;

bool servoActive = false; // piloté par backend

enum ServoState { MOVE_UP, PAUSE_TOP, MOVE_DOWN, PAUSE_BOTTOM };
ServoState servoState = PAUSE_BOTTOM;

int currentAngle = 0;
const int angleMin = 0;
const int angleMax = 90;

const int stepDeg = 1;                    // mouvement progressif (1°)
const unsigned long stepIntervalMs = 15;  // vitesse constante (ajuste 10..25)
const unsigned long pauseMs = 500;        // pause aux extrémités

unsigned long lastStepMs = 0;
unsigned long lastPauseMs = 0;

/* =========================
   POLLING SERVO STATUS
========================= */
unsigned long lastPollMs = 0;
const unsigned long pollIntervalMs = 1000; // 1s

/* =========================
   HELPERS HTTP
========================= */
String urlJoin(const char* path) {
  return String(baseUrl) + String(path);
}

bool httpGetServoStatus(bool &outActive) {
  HTTPClient http;
  http.begin(urlJoin("/servo/status"));
  int code = http.GET();
  if (code != 200) { http.end(); return false; }

  String payload = http.getString();
  http.end();

  // payload: {"id":1,"is_active":false,"updated_at":"..."}
  int idx = payload.indexOf("\"is_active\":");
  if (idx < 0) return false;

  String sub = payload.substring(idx + 12);
  sub.trim();
  outActive = sub.startsWith("true");
  return true;
}

/* =========================
   SERVO TICK (NON BLOQUANT)
========================= */
void servoTick(unsigned long now) {
  if (!servoActive) {
    // Immobilisé : tu peux choisir de forcer 0°
    // currentAngle = angleMin; monServo.write(currentAngle);
    return;
  }

  switch (servoState) {
    case MOVE_UP:
      if (now - lastStepMs >= stepIntervalMs) {
        lastStepMs = now;
        currentAngle += stepDeg;

        if (currentAngle >= angleMax) {
          currentAngle = angleMax;
          monServo.write(currentAngle);
          servoState = PAUSE_TOP;
          lastPauseMs = now;
        } else {
          monServo.write(currentAngle);
        }
      }
      break;

    case PAUSE_TOP:
      if (now - lastPauseMs >= pauseMs) {
        servoState = MOVE_DOWN;
      }
      break;

    case MOVE_DOWN:
      if (now - lastStepMs >= stepIntervalMs) {
        lastStepMs = now;
        currentAngle -= stepDeg;

        if (currentAngle <= angleMin) {
          currentAngle = angleMin;
          monServo.write(currentAngle);
          servoState = PAUSE_BOTTOM;
          lastPauseMs = now;
        } else {
          monServo.write(currentAngle);
        }
      }
      break;

    case PAUSE_BOTTOM:
      if (now - lastPauseMs >= pauseMs) {
        servoState = MOVE_UP;
      }
      break;
  }
}

void setup() {
  Serial.begin(115200);

  // Servo
  monServo.attach(servoPin);
  currentAngle = angleMin;
  monServo.write(currentAngle);
  servoState = PAUSE_BOTTOM;
  lastPauseMs = millis();

  // WiFi
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);

  Serial.print("Connexion WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(300);
    Serial.print(".");
  }
  Serial.println("\nWiFi OK. IP ESP32: " + WiFi.localIP().toString());
  Serial.println("Backend: " + String(baseUrl));
}

void loop() {
  unsigned long now = millis();

  // 1) Poll servo status
  if (now - lastPollMs >= pollIntervalMs) {
    lastPollMs = now;

    bool active;
    if (httpGetServoStatus(active)) {
      if (active != servoActive) {
        servoActive = active;
        Serial.println(String("servoActive=") + (servoActive ? "true" : "false"));

        // Quand on démarre, on repart proprement de 0°
        if (servoActive) {
          currentAngle = angleMin;
          monServo.write(currentAngle);
          servoState = PAUSE_BOTTOM;
          lastPauseMs = now;
        }
      }
    } else {
      Serial.println("GET /servo/status FAIL");
    }
  }

  // 2) Servo non bloquant
  servoTick(now);
}
