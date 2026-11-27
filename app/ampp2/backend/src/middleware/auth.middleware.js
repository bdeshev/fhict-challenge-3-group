const jwt = require('jsonwebtoken');
const { sendError } = require('../utils/api-response');

function authenticate(req, res, next) {
  const authorization = req.get('authorization');
  const [scheme, token] = authorization ? authorization.split(' ') : [];

  if (scheme !== 'Bearer' || !token) {
    return sendError(res, 401, 'Bearer token is required');
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return next(new Error('JWT_SECRET must be set in the environment'));
  }

  try {
    const payload = jwt.verify(token, secret);
    if (!payload.sub) {
      return sendError(res, 401, 'Invalid or expired token');
    }
    req.auth = { userId: payload.sub };
    return next();
  } catch (error) {
    return sendError(res, 401, 'Invalid or expired token');
  }
}

module.exports = authenticate;
