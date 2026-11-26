const { sendError } = require('../utils/api-response');

function notFound(req, res, next) {
  sendError(res, 404, 'Route not found');
}

module.exports = notFound;
