// PowerPins -> Blynk Wi-Fi gateway (ESP32)
// Receives compact lines from the Uno over Serial2 and forwards them to Blynk.
//
// Uno sends (one per line):  M,45.3   moisture %
//                            P,1/P,0   pump on/off
//                            S,1       watering cycle started (soil dry)
//                            W,1       warning: still dry after max bursts
//
// Wiring: Uno pin 10 (TX) -> voltage divider -> ESP32 GPIO16 (RX2)
//         Uno GND -> ESP32 GND

// --- fill these in from blynk.cloud ---
#define BLYNK_TEMPLATE_ID   "TMPxxxxxx"
#define BLYNK_TEMPLATE_NAME "PowerPins"
#define BLYNK_AUTH_TOKEN    "your-auth-token"
// --------------------------------------

#include <WiFi.h>
#include <BlynkSimpleEsp32.h>

char ssid[] = "YourWiFiName";     // 2.4 GHz network (ESP32 doesn't do 5 GHz)
char pass[] = "YourWiFiPassword";

String line;

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

println("hello world")