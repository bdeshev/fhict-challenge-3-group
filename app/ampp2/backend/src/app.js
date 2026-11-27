const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
const authRoutes = require('./routes/auth.routes');
const profileRoutes = require('./routes/profile.routes');
const settingsRoutes = require('./routes/settings.routes');
const plantRoutes = require('./routes/plant.routes');
const notificationRoutes = require('./routes/notification.routes');
const pushRoutes = require('./routes/push.routes');
const sensorRoutes = require('./routes/sensor.routes');
const wateringStatusRoutes = require('./routes/watering-status.routes');
const errorHandler = require('./middleware/error-handler');
const notFound = require('./middleware/not-found');
const { sendSuccess } = require('./utils/api-response');

const app = express();

app.set('etag', false); // no 304 revalidation

const startedAt = Date.now();

app.use(cors());
app.use(express.json());

// Swagger docs: never cache the page or the spec
app.use(['/docs', '/api-docs.json'], (req, res, next) => {
  res.set({
    'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
    Pragma: 'no-cache',
    Expires: '0',
       'Clear-Site-Data': '"cache"',
  });
  next();
});

app.get('/api-docs.json', (req, res) => res.json(swaggerSpec));
app.use(
  '/docs',
  swaggerUi.serve,
  swaggerUi.setup(null, {
    // The changing ?v= value means the browser can't reuse an old spec URL
    swaggerOptions: { url: `/api-docs.json?v=${startedAt}` },
  })
);

app.get('/health', (req, res) => {
  sendSuccess(res, { status: 'ok', message: 'Smart Plant Watering API is running' });
});

app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);
app.use('/settings', settingsRoutes);
app.use('/plants', plantRoutes);
app.use('/notifications', notificationRoutes);
app.use('/push', pushRoutes);
app.use('/sensor', sensorRoutes);
app.use('/watering', wateringStatusRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;