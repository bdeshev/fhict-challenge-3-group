const express = require('express');
const plantController = require('../controllers/plant.controller');
const authenticate = require('../middleware/auth.middleware');
const wateringController = require('../controllers/watering.controller');
const wateringHistoryController = require('../controllers/watering-history.controller');

const router = express.Router();

router.use(authenticate);

/**
 * @openapi
 * /plants/{id}/water:
 *   post:
 *     summary: Water a plant
 *     tags: [Plants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, example: 1 }
 *     responses:
 *       202:
 *         description: Simulated watering started
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
 *                   required: [message, plant, historyId, simulatedDurationMs]
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: Simulated watering started
 *                     plant:
 *                       $ref: '#/components/schemas/Plant'
 *                     historyId:
 *                       type: integer
 *                       example: 1
 *                     simulatedDurationMs:
 *                       type: integer
 *                       example: 3000
 *       400:
 *         description: Plant id must be a positive integer
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
 *       404:
 *         description: Plant not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Plant is already being watered
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
router.post('/:id/water', wateringController.water);

/**
 * @openapi
 * /plants/{id}/history:
 *   get:
 *     summary: Get the watering history of a plant
 *     tags: [Plants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, example: 1 }
 *     responses:
 *       200:
 *         description: Watering history entries
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
 *                   required: [history]
 *                   properties:
 *                     history:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/WateringHistory'
 *       400:
 *         description: Plant id must be a positive integer
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
 *       404:
 *         description: Plant not found
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
router.get('/:id/history', wateringHistoryController.listForPlant);

/**
 * @openapi
 * /plants/{id}/auto-decision:
 *   get:
 *     summary: Get the automatic watering decision for a plant
 *     tags: [Plants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, example: 1 }
 *     responses:
 *       200:
 *         description: Whether the plant should be watered now, and why
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
 *                   required: [wateringNeeded]
 *                   properties:
 *                     wateringNeeded:
 *                       type: boolean
 *                       example: true
 *       400:
 *         description: Plant id must be a positive integer
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
 *       404:
 *         description: Plant not found
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
router.get('/:id/auto-decision', plantController.getAutomaticWateringDecision);

/**
 * @openapi
 * /plants/search:
 *   get:
 *     summary: Search plants
 *     tags: [Plants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema: { type: string, example: basil }
 *         description: Search text matched against plant name and species
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, maximum: 100, default: 50, example: 10 }
 *         description: Maximum number of results
 *     responses:
 *       200:
 *         description: Matching plants
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
 *                   required: [plants]
 *                   properties:
 *                     plants:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Plant'
 *       400:
 *         description: A non-empty q search parameter is required / Search query must be 100 characters or fewer / limit must be an integer between 1 and 100
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
router.get('/search', plantController.search);

/**
 * @openapi
 * /plants:
 *   get:
 *     summary: List the current user's plants
 *     tags: [Plants]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of plants
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
 *                   required: [plants]
 *                   properties:
 *                     plants:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Plant'
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
router.get('/', plantController.list);

/**
 * @openapi
 * /plants/{id}:
 *   get:
 *     summary: Get a plant by id
 *     tags: [Plants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, example: 1 }
 *     responses:
 *       200:
 *         description: The plant
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
 *                   $ref: '#/components/schemas/Plant'
 *       400:
 *         description: Plant id must be a positive integer
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
 *       404:
 *         description: Plant not found
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
router.get('/:id', plantController.get);

/**
 * @openapi
 * /plants:
 *   post:
 *     summary: Create a plant
 *     tags: [Plants]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, species, threshold]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Basil
 *               species:
 *                 type: string
 *                 example: Ocimum basilicum
 *               threshold:
 *                 type: number
 *                 example: 30
 *               moisture:
 *                 type: number
 *                 example: 45
 *               autoMode:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       201:
 *         description: Plant created
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
 *                   $ref: '#/components/schemas/Plant'
 *       400:
 *         description: A plant object is required / One or more plant fields are not supported / At least one plant field is required / name must be a non-empty string / species must be a non-empty string / threshold must be a finite number / name and species are required
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
router.post('/', plantController.create);

/**
 * @openapi
 * /plants/{id}:
 *   put:
 *     summary: Update a plant
 *     tags: [Plants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, example: 1 }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Basil
 *               species:
 *                 type: string
 *                 example: Ocimum basilicum
 *               threshold:
 *                 type: number
 *                 example: 30
 *               autoMode:
 *                 type: boolean
 *                 example: true
 *             description: At least one of name, species, threshold, autoMode is required
 *     responses:
 *       200:
 *         description: Plant updated
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
 *                   $ref: '#/components/schemas/Plant'
 *       400:
 *         description: Plant id must be a positive integer / A plant object is required / One or more plant fields are not supported / At least one plant field is required / name must be a non-empty string / species must be a non-empty string / threshold must be a finite number / autoMode must be a boolean
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
 *       404:
 *         description: Plant not found
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
router.put('/:id', plantController.update);

/**
 * @openapi
 * /plants/{id}:
 *   delete:
 *     summary: Delete a plant
 *     tags: [Plants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, example: 1 }
 *     responses:
 *       200:
 *         description: Plant deleted
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
 *         description: Plant id must be a positive integer
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
 *       404:
 *         description: Plant not found
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
router.delete('/:id', plantController.remove);

module.exports = router;
