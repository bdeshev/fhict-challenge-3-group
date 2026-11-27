const express = require('express');
const sensorController = require('../controllers/sensor.controller');

const router = express.Router();

/**
 * @openapi
 * /sensor/reading:
 *   post:
 *     summary: Submit a sensor reading (called by the plant device)
 *     tags: [Sensor]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [deviceId, rawValue, moisturePercent, timestamp]
 *             properties:
 *               deviceId:
 *                 type: string
 *                 maxLength: 128
 *                 example: esp32-basil-01
 *               rawValue:
 *                 type: number
 *                 example: 512
 *               moisturePercent:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *                 example: 34.5
 *               timestamp:
 *                 type: string
 *                 format: date-time
 *                 example: 2026-01-15T08:30:00.000Z
 *     responses:
 *       201:
 *         description: Reading stored
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required: [success, data]
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/SensorReadingResponse'
 *       400:
 *         description: A sensor reading object is required / deviceId must be a non-empty string of at most 128 characters / rawValue must be a finite number / moisturePercent must be a number between 0 and 100 / timestamp must be a valid date string
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/reading', sensorController.createReading);

module.exports = router;
