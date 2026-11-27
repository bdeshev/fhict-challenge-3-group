// PowerPins -> cloud Wi-Fi gateway (ESP32)
// Receives compact lines from the Uno over Serial2 and forwards them to
// your own server (POST /api/report).
//
// Uno sends (one per line):  M,45.3   moisture %
//                            P,1/P,0   pump on/off
//                            S,1       watering cycle started (soil dry)
//                            W,1       warning: still dry after max bursts
//
// Wiring: Uno pin 10 (TX) -> level shifter -> ESP32 GPIO16 (RX2)
//         Uno GND -> ESP32 GND

// --- your own cloud server ---
const char* API_HOST = "https://bd1.wild-lionfish.ts.net";  // Tailscale Funnel -> bd1:8080
const char* API_KEY  = "e0de835334d82744bb27220dfff88414"; // same as API_KEY on the server
// -------------------------------

#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>

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

  if (code == 'M' || code == 'P' || code == 'S' || code == 'W')
    postToServer(code, value);
}

void setup() {
  Serial.begin(115200);
  Serial2.begin(9600, SERIAL_8N1, 16, 17);  // RX=GPIO16 (from Uno), TX=17 unused
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, pass);
  Serial.print("Connecting to Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print('.');
  }
  Serial.println();
  Serial.println("Connected to Wi-Fi");
}

void loop() {
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
