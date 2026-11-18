// PowerPins -> cloud Wi-Fi gateway (ESP32)
// Receives compact lines from the Uno over Serial2 and forwards them to
// your own server (POST /api/report) and to Blynk.
//
// Uno sends (one per line):  M,45.3   moisture %
//                            P,1/P,0   pump on/off
//                            S,1       watering cycle started (soil dry)
//                            W,1       warning: still dry after max bursts
//
// Wiring: Uno pin 10 (TX) -> voltage divider -> ESP32 GPIO16 (RX2)
//         Uno GND -> ESP32 GND

// --- fill these in from blynk.cloud ---
#define BLYNK_TEMPLATE_ID   "TMPL45a1f0KUC"
#define BLYNK_TEMPLATE_NAME "PowerPins"
#define BLYNK_AUTH_TOKEN    "ywd-pJk9WUwEKaTKNdtivZF5rju_c_dc"
// --------------------------------------

// --- your own cloud server ---
const char* API_HOST = "https://bd1.wild-lionfish.ts.net";  // Tailscale Funnel -> bd1:8080
const char* API_KEY  = "e0de835334d82744bb27220dfff88414"; // same as API_KEY on the server
// -------------------------------

#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <BlynkSimpleEsp32.h>

char ssid[] = "B's A55";            // 2.4 GHz network (ESP32 doesn't do 5 GHz)
char pass[] = "102030parola";

String line;

// forward one event to your server: POST {host}/api/report  {"c":"M","v":41.2}
void postToServer(char code, float value) {
  WiFiClientSecure client;
  client.setInsecure();  // skip certificate check (fine for plant data)
  HTTPClient http;
  http.begin(client, String(API_HOST) + "/api/report");
  http.addHeader("Content-Type", "application/json");
  http.addHeader("Authorization", String("Bearer ") + API_KEY);
  http.setTimeout(3000);
  String body = String("{\"c\":\"") + code + "\",\"v\":" + String(value, 1) + "}";
  int rc = http.POST(body);
  if (rc != 200) {
    Serial.print("server post failed: ");
    Serial.println(rc);
  }
  http.end();
}

void handleLine(const String &l) {
  int comma = l.indexOf(',');
  if (comma < 1) return;
  char code = l.charAt(0);
  float value = l.substring(comma + 1).toFloat();
  Serial.print("from Uno: ");
  Serial.println(l);

  switch (code) {
    case 'M':  // moisture %
      Blynk.virtualWrite(V0, value);
      break;
    case 'P':  // pump state 0/1
      Blynk.virtualWrite(V1, (int)value);
      break;
    case 'S':  // watering cycle started -> push notification
      Blynk.logEvent("watering");
      break;
    case 'W':  // still dry after max bursts -> push notification
      Blynk.virtualWrite(V2, "Still dry after max bursts");
      Blynk.logEvent("dry_warning");
      break;
  }
  if (code == 'M' || code == 'P' || code == 'S' || code == 'W')
    postToServer(code, value);
}

void setup() {
  Serial.begin(115200);
  Serial2.begin(9600, SERIAL_8N1, 16, 17);  // RX=GPIO16 (from Uno), TX=17 unused
  Blynk.begin(BLYNK_AUTH_TOKEN, ssid, pass);
  Serial.println("Connected to Blynk");
}

void loop() {
  Blynk.run();
  while (Serial2.available()) {
    char c = (char)Serial2.read();
    if (c == '\n') {
      handleLine(line);
      line = "";
    } else if (c != '\r' && line.length() < 40) {
      line += c;
    }
  }
}
