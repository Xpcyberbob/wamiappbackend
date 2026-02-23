/*
 * ============================================================
 * WAMI - ESP32 Backend Connection
 * ============================================================
 * 
 * Ce code permet à l'ESP32 de :
 * 1. Se connecter au Wi-Fi
 * 2. Lire la température via un capteur DS18B20
 * 3. Envoyer la température au backend Render (POST /temperature)
 * 4. Lire l'état du servo depuis le backend (GET /servo/status)
 * 5. Contrôler le servo moteur en fonction de l'état reçu
 * 
 * Backend URL : https://wamiappbackend.onrender.com
 * 
 * Endpoints utilisés :
 *   POST /temperature        → Envoie {deviceId, tempC}
 *   GET  /servo/status       → Reçoit {is_active: true/false}
 * 
 * Matériel requis :
 *   - ESP32 (n'importe quel modèle)
 *   - Capteur DS18B20 (température) + résistance 4.7kΩ
 *   - Servo moteur (SG90 ou similaire)
 * 
 * Bibliothèques à installer (Arduino IDE → Gestionnaire de bibliothèques) :
 *   - OneWire (par Jim Studt)
 *   - DallasTemperature (par Miles Burton)
 *   - ESP32Servo (par Kevin Harrington)
 *   - ArduinoJson (par Benoit Blanchon)
 * ============================================================
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <ESP32Servo.h>

// ============================================================
// ⚙️ CONFIGURATION - À MODIFIER SELON VOTRE INSTALLATION
// ============================================================

// Wi-Fi
const char* WIFI_SSID     = "VOTRE_WIFI_SSID";       // ← Nom de votre réseau Wi-Fi
const char* WIFI_PASSWORD  = "VOTRE_WIFI_PASSWORD";   // ← Mot de passe Wi-Fi

// Backend Render
const char* BACKEND_URL    = "https://wamiappbackend.onrender.com";
const char* DEVICE_ID      = "esp32-001";             // Identifiant unique de cet ESP32

// Pins
const int DS18B20_PIN      = 4;    // Pin du capteur de température DS18B20
const int SERVO_PIN        = 13;   // Pin du servo moteur

// Intervalles (en millisecondes)
const unsigned long TEMP_INTERVAL  = 5000;   // Envoi température toutes les 5 secondes
const unsigned long SERVO_INTERVAL = 3000;   // Vérification état servo toutes les 3 secondes

// ============================================================
// 🔧 OBJETS GLOBAUX
// ============================================================

OneWire oneWire(DS18B20_PIN);
DallasTemperature sensors(&oneWire);
Servo servoMoteur;

unsigned long lastTempSend  = 0;
unsigned long lastServoCheck = 0;
bool servoActive = false;
bool wifiConnected = false;

// ============================================================
// 📶 CONNEXION WI-FI
// ============================================================

void connectWiFi() {
  Serial.print("📶 Connexion au Wi-Fi : ");
  Serial.println(WIFI_SSID);
  
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    wifiConnected = true;
    Serial.println();
    Serial.println("✅ Wi-Fi connecté !");
    Serial.print("   IP locale : ");
    Serial.println(WiFi.localIP());
  } else {
    wifiConnected = false;
    Serial.println();
    Serial.println("❌ Échec connexion Wi-Fi. Réessai dans 5s...");
  }
}

// Vérifier et reconnecter le Wi-Fi si nécessaire
void checkWiFi() {
  if (WiFi.status() != WL_CONNECTED) {
    wifiConnected = false;
    Serial.println("⚠️ Wi-Fi déconnecté. Reconnexion...");
    connectWiFi();
  }
}

// ============================================================
// 🌡️ ENVOI TEMPÉRATURE AU BACKEND
// ============================================================

void sendTemperature() {
  // Lire la température du capteur DS18B20
  sensors.requestTemperatures();
  float tempC = sensors.getTempCByIndex(0);
  
  // Vérifier que la lecture est valide
  if (tempC == DEVICE_DISCONNECTED_C || tempC < -50 || tempC > 100) {
    Serial.println("⚠️ Lecture température invalide : capteur déconnecté ?");
    return;
  }
  
  Serial.print("🌡️ Température lue : ");
  Serial.print(tempC, 1);
  Serial.println(" °C");
  
  // Envoyer au backend
  if (!wifiConnected) return;
  
  HTTPClient http;
  String url = String(BACKEND_URL) + "/temperature";
  
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  
  // Construire le JSON
  StaticJsonDocument<128> doc;
  doc["deviceId"] = DEVICE_ID;
  doc["tempC"] = round(tempC * 10.0) / 10.0;  // Arrondir à 1 décimale
  
  String body;
  serializeJson(doc, body);
  
  int httpCode = http.POST(body);
  
  if (httpCode == 200) {
    Serial.println("   ✅ Température envoyée au backend");
  } else {
    Serial.print("   ❌ Erreur envoi température, code HTTP : ");
    Serial.println(httpCode);
    if (httpCode > 0) {
      Serial.print("   Réponse : ");
      Serial.println(http.getString());
    }
  }
  
  http.end();
}

// ============================================================
// 🤖 LECTURE ÉTAT SERVO DEPUIS LE BACKEND
// ============================================================

void checkServoState() {
  if (!wifiConnected) return;
  
  HTTPClient http;
  String url = String(BACKEND_URL) + "/servo/status";
  
  http.begin(url);
  int httpCode = http.GET();
  
  if (httpCode == 200) {
    String payload = http.getString();
    
    // Parser le JSON
    StaticJsonDocument<256> doc;
    DeserializationError error = deserializeJson(doc, payload);
    
    if (!error) {
      bool newState = doc["is_active"] | false;
      
      // Si l'état a changé, actionner le servo
      if (newState != servoActive) {
        servoActive = newState;
        
        if (servoActive) {
          Serial.println("🤖 Servo ACTIVÉ (commande depuis l'app)");
          servoMoteur.write(180);  // Position ouverte (distribuer nourriture)
        } else {
          Serial.println("🤖 Servo DÉSACTIVÉ (commande depuis l'app)");
          servoMoteur.write(0);    // Position fermée
        }
      }
    } else {
      Serial.print("   ❌ Erreur parsing JSON : ");
      Serial.println(error.c_str());
    }
  } else {
    Serial.print("   ❌ Erreur lecture servo, code HTTP : ");
    Serial.println(httpCode);
  }
  
  http.end();
}

// ============================================================
// 🚀 SETUP
// ============================================================

void setup() {
  Serial.begin(115200);
  delay(1000);
  
  Serial.println();
  Serial.println("============================================");
  Serial.println("   WAMI ESP32 - Connexion Backend Render");
  Serial.println("============================================");
  Serial.print("   Backend : ");
  Serial.println(BACKEND_URL);
  Serial.print("   Device  : ");
  Serial.println(DEVICE_ID);
  Serial.println("============================================");
  
  // Initialiser le capteur de température
  sensors.begin();
  Serial.print("🌡️ Capteurs DS18B20 trouvés : ");
  Serial.println(sensors.getDeviceCount());
  
  // Initialiser le servo
  servoMoteur.attach(SERVO_PIN);
  servoMoteur.write(0);  // Position initiale (fermé)
  Serial.println("🤖 Servo initialisé (position 0°)");
  
  // Connexion Wi-Fi
  connectWiFi();
  
  Serial.println();
  Serial.println("🟢 ESP32 prêt ! Début des communications...");
  Serial.println();
}

// ============================================================
// 🔄 LOOP
// ============================================================

void loop() {
  // Vérifier la connexion Wi-Fi
  checkWiFi();
  
  unsigned long now = millis();
  
  // Envoyer la température toutes les TEMP_INTERVAL ms
  if (now - lastTempSend >= TEMP_INTERVAL) {
    lastTempSend = now;
    sendTemperature();
  }
  
  // Vérifier l'état du servo toutes les SERVO_INTERVAL ms
  if (now - lastServoCheck >= SERVO_INTERVAL) {
    lastServoCheck = now;
    checkServoState();
  }
  
  delay(100);  // Petit délai pour ne pas surcharger le CPU
}
