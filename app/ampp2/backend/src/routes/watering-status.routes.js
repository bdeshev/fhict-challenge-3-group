const express = require('express');
const wateringStatusController = require('../controllers/watering-status.controller');

const router = express.Router();

/**
 * @openapi
 * /watering/status:
 *   post:
 *     summary: Report the watering status (called by the plant device)
 *     tags: [Watering]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [deviceId, isWatering]
 *             properties:
 *               deviceId:
 *                 type: string
 *                 maxLength: 128
 *                 example: esp32-basil-01
 *               isWatering:
 *                 type: boolean
 *                 example: true
 *               timestamp:
 *                 type: string
 *                 format: date-time
 *                 example: 2026-01-15T08:30:00.000Z
 *     responses:
 *       201:
 *         description: Status stored
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
 *                   type: object
 *                   required: [status]
 *                   properties:
 *                     status:
 *                       $ref: '#/components/schemas/WateringStatus'
 *       400:
 *         description: A watering status object is required / deviceId must be a non-empty string of at most 128 characters / isWatering must be a boolean / timestamp must be a valid date string
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
router.post('/status', wateringStatusController.createStatus);

module.exports = router;
