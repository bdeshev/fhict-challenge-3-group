const express = require('express');
const settingsController = require('../controllers/settings.controller');
const authenticate = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authenticate);

/**
 * @openapi
 * /settings:
 *   get:
 *     summary: Get the current user's settings
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: The settings
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
 *                   $ref: '#/components/schemas/Settings'
 *       401:
 *         description: Bearer token is required or Invalid or expired token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User settings not found
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
router.get('/', settingsController.getSettings);

/**
 * @openapi
 * /settings:
 *   put:
 *     summary: Update the current user's settings
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               theme:
 *                 type: string
 *                 enum: [system, light, dark]
 *                 example: system
 *               language:
 *                 type: string
 *                 example: en
 *               notificationsEnabled:
 *                 type: boolean
 *                 example: true
 *               defaultAutoMode:
 *                 type: boolean
 *                 example: false
 *             description: At least one of theme, language, notificationsEnabled, defaultAutoMode is required
 *     responses:
 *       200:
 *         description: Settings updated
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
 *                   $ref: '#/components/schemas/Settings'
 *       400:
 *         description: A settings object is required / One or more settings fields are not supported / At least one setting is required / theme must be system, light, or dark / language must be a valid language tag / notificationsEnabled must be a boolean / defaultAutoMode must be a boolean
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
router.put('/', settingsController.updateSettings);

module.exports = router;
