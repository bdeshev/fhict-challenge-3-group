const path = require('path');
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  failOnErrors: true,
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Smart Plant Watering API',
      version: '1.0.0',
      description: 'API for plants, watering, sensors and notifications',
    },
    servers: [{ url: `http://localhost:${process.env.PORT || 3000}` }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
      schemas: {
        User: {
          type: 'object',
          required: ['id', 'username', 'email', 'createdAt'],
          properties: {
            id: { type: 'integer', example: 1 },
            username: { type: 'string', example: 'john_doe' },
            email: { type: 'string', format: 'email', example: 'john@example.com' },
            createdAt: { type: 'string', format: 'date-time', example: '2026-01-15T08:30:00.000Z' },
          },
        },
        Profile: {
          type: 'object',
          required: ['username', 'email', 'createdAt'],
          properties: {
            username: { type: 'string', example: 'john_doe' },
            email: { type: 'string', format: 'email', example: 'john@example.com' },
            profilePicture: { type: 'string', nullable: true, example: null },
            createdAt: { type: 'string', format: 'date-time', example: '2026-01-15T08:30:00.000Z' },
          },
        },
        Plant: {
          type: 'object',
          required: ['id', 'userId', 'name', 'species', 'threshold', 'autoMode', 'isWatering', 'createdAt'],
          properties: {
            id: { type: 'integer', example: 1 },
            userId: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Basil' },
            species: { type: 'string', example: 'Ocimum basilicum' },
            moisture: { type: 'number', nullable: true, example: 34.5 },
            threshold: { type: 'number', example: 30 },
            autoMode: { type: 'boolean', example: true },
            isWatering: { type: 'boolean', example: false },
            lastWateredAt: { type: 'string', format: 'date-time', nullable: true },
            createdAt: { type: 'string', format: 'date-time', example: '2026-01-15T08:30:00.000Z' },
            plantInformation: { $ref: '#/components/schemas/PlantInformation', nullable: true },
          },
        },
        PlantInformation: {
          type: 'object',
          properties: {
            species: { type: 'string', example: 'Ocimum basilicum' },
            description: { type: 'string', example: 'Culinary herb with sweet, aromatic leaves.' },
            wateringTips: { type: 'string', example: 'Keep soil moist but not soggy.' },
            sunlight: { type: 'string', example: 'Full sun' },
            idealMoistureMin: { type: 'number', example: 20 },
            idealMoistureMax: { type: 'number', example: 40 },
            cachedAt: { type: 'string', format: 'date-time', example: '2026-01-15T09:00:00.000Z' },
          },
        },
        Notification: {
          type: 'object',
          required: ['id', 'userId', 'title', 'message', 'type', 'read', 'createdAt'],
          properties: {
            id: { type: 'integer', example: 1 },
            userId: { type: 'integer', example: 1 },
            title: { type: 'string', example: 'Plant needs water' },
            message: { type: 'string', example: 'Your basil plant is below the moisture threshold.' },
            type: { type: 'string', example: 'watering' },
            read: { type: 'boolean', example: false },
            createdAt: { type: 'string', format: 'date-time', example: '2026-01-15T08:30:00.000Z' },
          },
        },
        SensorReading: {
          type: 'object',
          required: ['id', 'deviceId', 'rawValue', 'moisturePercent', 'timestamp'],
          properties: {
            id: { type: 'integer', example: 1 },
            deviceId: { type: 'string', example: 'esp32-basil-01' },
            rawValue: { type: 'number', example: 512 },
            moisturePercent: { type: 'number', example: 34.5 },
            timestamp: { type: 'string', format: 'date-time', example: '2026-01-15T08:30:00.000Z' },
          },
        },
        WateringHistory: {
          type: 'object',
          required: ['id', 'plantId', 'startedAt', 'duration', 'automatic', 'status'],
          properties: {
            id: { type: 'integer', example: 1 },
            plantId: { type: 'integer', example: 1 },
            startedAt: { type: 'string', format: 'date-time', example: '2026-01-15T08:30:00.000Z' },
            duration: { type: 'integer', example: 3 },
            automatic: { type: 'boolean', example: false },
            completedAt: { type: 'string', format: 'date-time', nullable: true },
            status: { type: 'string', example: 'completed' },
          },
        },
        WateringStatus: {
          type: 'object',
          required: ['id', 'deviceId', 'isWatering', 'timestamp'],
          properties: {
            id: { type: 'integer', example: 1 },
            deviceId: { type: 'string', example: 'esp32-basil-01' },
            isWatering: { type: 'boolean', example: true },
            timestamp: { type: 'string', format: 'date-time', example: '2026-01-15T08:30:00.000Z' },
          },
        },
        PushToken: {
          type: 'object',
          required: ['id', 'platform', 'createdAt'],
          properties: {
            id: { type: 'integer', example: 1 },
            platform: { type: 'string', example: 'ios' },
            createdAt: { type: 'string', format: 'date-time', example: '2026-01-15T08:30:00.000Z' },
          },
        },
        Settings: {
          type: 'object',
          required: ['theme', 'language', 'notificationsEnabled', 'defaultAutoMode'],
          properties: {
            theme: { type: 'string', example: 'system' },
            language: { type: 'string', example: 'en' },
            notificationsEnabled: { type: 'boolean', example: true },
            defaultAutoMode: { type: 'boolean', example: false },
          },
        },
        Error: {
          type: 'object',
          required: ['success', 'message'],
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Something went wrong' },
          },
        },
        SensorReadingResponse: {
          type: 'object',
          required: ['reading', 'plant', 'wateringNeeded', 'command'],
          properties: {
            reading: { $ref: '#/components/schemas/SensorReading' },
            plant: { $ref: '#/components/schemas/Plant', nullable: true },
            wateringNeeded: { type: 'boolean', example: false },
            command: { type: 'string', example: 'NONE' },
          },
        },
      },
    },
  },
  apis: [path.join(__dirname, 'routes', '*.js').replace(/\\/g, '/')],
};

const spec = swaggerJsdoc(options);
console.log('Swagger paths found:', Object.keys(spec.paths || {}));

module.exports = spec;
