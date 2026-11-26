const plantService = require('../services/plant.service');
const { sendSuccess } = require('../utils/api-response');

async function list(req, res, next) {
  try {
    const plants = await plantService.listForUser(req.auth.userId);
    sendSuccess(res, { plants });
  } catch (error) {
    next(error);
  }
}

async function search(req, res, next) {
  try {
    const plants = await plantService.searchForUser(req.query.q, req.query.limit, req.auth.userId);
    sendSuccess(res, { plants });
  } catch (error) {
    next(error);
  }
}

async function get(req, res, next) {
  try {
    const plant = await plantService.getForUser(req.params.id, req.auth.userId);
    sendSuccess(res, { plant });
  } catch (error) {
    next(error);
  }
}

async function getAutomaticWateringDecision(req, res, next) {
  try {
    const decision = await plantService.getAutomaticWateringDecision(req.params.id, req.auth.userId);
    sendSuccess(res, decision);
  } catch (error) {
    next(error);
  }
}

async function create(req, res, next) {
  try {
    const plant = await plantService.createForUser(req.body, req.auth.userId);
    sendSuccess(res, { plant }, 201);
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const plant = await plantService.updateForUser(req.params.id, req.body, req.auth.userId);
    sendSuccess(res, { plant });
  } catch (error) {
    next(error);
  }
}

async function remove(req, res, next) {
  try {
    await plantService.deleteForUser(req.params.id, req.auth.userId);
    sendSuccess(res, {});
  } catch (error) {
    next(error);
  }
}

module.exports = {
  list,
  search,
  get,
  getAutomaticWateringDecision,
  create,
  update,
  remove
};
