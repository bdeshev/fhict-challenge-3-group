const express = require('express');
const pushTokenController = require('../controllers/push-token.controller');
const authenticate = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authenticate);

/**
 * @openapi
 * /push/register:
 *   post:
 *     summary: Register a push notification token for this device
 *     tags: [Push]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [deviceToken, platform]
 *             properties:
 *               deviceToken:
 *                 type: string
 *                 maxLength: 4096
 *                 example: ExAMPLEpushToken123
 *               platform:
 *                 type: string
 *                 maxLength: 30
 *                 example: ios
 *     responses:
 *       200:
 *         description: Token registered
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
 *                   $ref: '#/components/schemas/PushToken'
 *       400:
 *         description: A deviceToken and platform are required / deviceToken must be a non-empty string of at most 4096 characters / platform must be a non-empty string of at most 30 characters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Bearer token is required or Invalid or expired token
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
router.post('/register', pushTokenController.register);

/**
 * @openapi
 * /push/register:
 *   delete:
 *     summary: Remove a push notification token
 *     tags: [Push]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [deviceToken, platform]
 *             properties:
 *               deviceToken:
 *                 type: string
 *                 maxLength: 4096
 *                 example: ExAMPLEpushToken123
 *               platform:
 *                 type: string
 *                 maxLength: 30
 *                 example: ios
 *     responses:
 *       200:
 *         description: Token removed
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
 *                   example: {}
 *       400:
 *         description: A deviceToken and platform are required / deviceToken must be a non-empty string of at most 4096 characters / platform must be a non-empty string of at most 30 characters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Bearer token is required or Invalid or expired token
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
router.delete('/register', pushTokenController.remove);

module.exports = router;
