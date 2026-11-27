// ---------------------------------------------------------------
// PowerPins wiring overview
//
// Moisture sensor:
//   sensor VCC   -> Uno 5V
//   sensor GND   -> Uno GND
//   sensor OUT   -> Uno A2 (analog, calibrated via dryValue/wetValue)
//
// Pump:
//   Uno A1 -> pump driver (transistor/MOSFET/relay) -> pump motor
//   pumpActiveHigh below decides whether the driver is active-HIGH
//
// Serial link to the ESP32 Wi-Fi gateway (9600 baud, one line per event):
//   Uno pin 10 (TX) -> level shifter HV side
//                     -> level shifter LV side -> ESP32 GPIO16 (RX2)
//   Shifter power:  HV = Uno 5V, LV = ESP32 3V3, GND shared by both boards
//   Uno GND -> ESP32 GND (common ground is required)
//   Uno pin 11 (RX) and ESP32 GPIO17 (TX2) are unused
//
// Debugging: Uno USB serial at 9600 baud stays free for the monitor.
// ESP32 side lives in ESP32Gateway/ESP32Gateway.ino.
// ---------------------------------------------------------------
#include <SoftwareSerial.h>

const int sensorPin = A2;
const int pumpPin = A1;

// Link to ESP32 Wi-Fi gateway: TX = pin 10 -> ESP32 GPIO16 (RX2)
// RX pin 11 unused. Uno's USB Serial stays free for debugging.
SoftwareSerial link(11, 10);

const int dryValue = 360;  // raw in dry air
const int wetValue = 290;  // raw in water

// Watering behavior:
const float dryThreshold = 30.0;         // start watering below this %
const bool pumpActiveHigh = true;       // set false if pump runs when it shouldn't
const unsigned long pumpBurstMs = 3000; // pump runtime per burst
const unsigned long soakMs = 20000;      // wait for water to soak in
const unsigned long checkMs = 5000;      // measure interval when idle
const int maxBursts = 10;               // safety: give up after this many in a row

float readMoisture() {
  long sum = 0;
  for (int i = 0; i < 20; i++) {
    sum += analogRead(sensorPin);
    delay(5);
  }
  float raw = sum / 20.0;
  float percent = (raw - dryValue) * 100.0 / (wetValue - dryValue);
  if (percent < 0) percent = 0;
  if (percent > 100) percent = 100;
  return percent;
}

// Send one compact line to the ESP32, e.g. "M,45.3"
void report(const char *tag, float value) {
  link.print(tag);
  link.print(",");
  link.println(value, 1);
}

void setPump(bool on) {
  if (pumpActiveHigh) digitalWrite(pumpPin, on ? HIGH : LOW);
  else digitalWrite(pumpPin, on ? LOW : HIGH);
  report("P", on ? 1 : 0);
}

void setup() {
  Serial.begin(9600);
  link.begin(9600);
  pinMode(pumpPin, OUTPUT);
  setPump(false);
}

void loop() {
  float percent = readMoisture();
  report("M", percent);
  Serial.print("moisture: ");
  Serial.print(percent, 1);
  Serial.println("%");

  if (percent >= dryThreshold) {
    delay(checkMs);
    return;
  }

  Serial.println("soil dry - watering");
  report("S", 1);
  int bursts = 0;
  while (percent < dryThreshold && bursts < maxBursts) {
    setPump(true);
    delay(pumpBurstMs);
    setPump(false);
    bursts++;

    Serial.print("pump burst ");
    Serial.print(bursts);
    Serial.println(" done, soaking...");
    delay(soakMs);

    percent = readMoisture();
    report("M", percent);
    Serial.print("moisture after soak: ");
    Serial.print(percent, 1);
    Serial.println("%");
  }

  if (bursts >= maxBursts) {
    Serial.println("WARNING: still dry after max bursts - check pump/water, waiting 10 min");
    report("W", 1);
    delay(600000UL);
  }
}