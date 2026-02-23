#include <WiFi.h>
#include <HTTPClient.h>
#include <ESP32Servo.h>

#include <OneWire.h>
#include <DallasTemperature.h>

/* =========================
   CONFIG WIFI + BACKEND
========================= */
const char* ssid = "Galaxy A54 5G D195";
const char* password = "dominique2024a";

const char* baseUrl = "https://wamiappbackend.onrender.com";
const char* deviceId = "esp32-001";

/* =========================
   DS18B20
========================= */
#define ONE_WIRE_BUS 15
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);

unsigned long lastTempMs = 0;
const unsigned long tempIntervalMs = 5000; // toutes les 5s

bool httpPostTemperature(float tempC) {
  HTTPClient http;
  http.begin(String(baseUrl) + "/temperature");
  http.addHeader("Content-Type", "application/json");

  String body = String("{\"deviceId\":\"") + deviceId + "\",\"tempC\":" + String(tempC, 2) + "}";
  int code = http.POST(body);
  http.end();

  return (code >= 200 && code < 300);
}

/* =========================
   SERVO (FAST 0° <-> 90°)
   0° pause 500ms -> 90° pause 500ms -> repeat
   NON BLOQUANT
========================= */
Servo monServo;
const int servoPin = 13;

bool servoActive = false; // piloté par backend

enum ServoState { GO_0, WAIT_0, GO_90, WAIT_90 };
ServoState servoState = GO_0;

const int angleMin = 0;
const int angleMax = 90;
const unsigned long pauseMs = 500;

unsigned long stateStartMs = 0;

void servoTick(unsigned long now) {
  if (!servoActive) return;

  switch (servoState) {
    case GO_0:
      monServo.write(angleMin);
      servoState = WAIT_0;
      stateStartMs = now;
      break;

    case WAIT_0:
      if (now - stateStartMs >= pauseMs) {
        servoState = GO_90;
      }
      break;

    case GO_90:
      monServo.write(angleMax);
      servoState = WAIT_90;
      stateStartMs = now;
      break;

    case WAIT_90:
      if (now - stateStartMs >= pauseMs) {
        servoState = GO_0;
      }
      break;
  }
}

/* =========================
   POLLING SERVO STATUS
========================= */
unsigned long lastPollMs = 0;
const unsigned long pollIntervalMs = 1000; // 1s

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

  int idx = payload.indexOf("\"is_active\":");
  if (idx < 0) return false;

  String sub = payload.substring(idx + 12);
  sub.trim();
  outActive = sub.startsWith("true");
  return true;
}

void setup() {
  Serial.begin(115200);

  // DS18B20
  sensors.begin();

  // Servo
  monServo.attach(servoPin);
  monServo.write(angleMin);
  servoState = GO_0;
  stateStartMs = millis();

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

        // Quand on démarre, on repart proprement sur 0°
        if (servoActive) {
          servoState = GO_0;
          stateStartMs = now;
        } else {
          // optionnel: immobiliser à 0° quand OFF
          monServo.write(angleMin);
        }
      }
    } else {
      Serial.println("GET /servo/status FAIL");
    }
  }

  // 2) Lecture Temp + POST toutes les 5s
  if (now - lastTempMs >= tempIntervalMs) {
    lastTempMs = now;

    sensors.requestTemperatures();
    float t = sensors.getTempCByIndex(0);

    Serial.print("TempC=");
    Serial.println(t);

    if (t > -50 && t < 125) {
      bool ok = httpPostTemperature(t);
      Serial.println(ok ? "POST /temperature OK" : "POST /temperature FAIL");
    } else {
      Serial.println("Temp invalide (capteur/pull-up/pin?)");
    }
  }

  // 3) Servo non bloquant (FAST 0° <-> 90°)
  servoTick(now);
}
 