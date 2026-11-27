const { sendError } = require('../utils/api-response');

function errorHandler(err, req, res, next) {
  console.error(err);
  if (res.headersSent) return next(err);

  const statusCode = err.statusCode || err.status || 500;
  const message = statusCode >= 500 ? 'Internal server error' : err.message;
  sendError(res, statusCode, message || 'Request failed');
}

module.exports = errorHandler;
