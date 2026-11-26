const plantModel = require('../models/plant.model');
const plantInformationService = require('./plant-information.service');
const HttpError = require('../utils/http-error');

const WRITABLE_FIELDS = new Set([
  'name',
  'species',
  'threshold',
  'autoMode'
]);
const BOOLEAN_FIELDS = new Set(['autoMode']);

function parsePlantId(rawId) {
  const id = Number(rawId);
  if (!Number.isSafeInteger(id) || id < 1) {
    throw new HttpError(400, 'Plant id must be a positive integer');
  }
  return id;
}

function validateFields(input, { requireCoreFields = false } = {}) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new HttpError(400, 'A plant object is required');
  }

  const fields = Object.keys(input);
  if (fields.some((field) => !WRITABLE_FIELDS.has(field))) {
    throw new HttpError(400, 'One or more plant fields are not supported');
  }
  if (fields.length === 0) {
    throw new HttpError(400, 'At least one plant field is required');
  }

  const changes = { ...input };
  for (const field of ['name', 'species']) {
    if (changes[field] !== undefined) {
      if (typeof changes[field] !== 'string' || changes[field].trim().length === 0) {
        throw new HttpError(400, `${field} must be a non-empty string`);
      }
      changes[field] = changes[field].trim();
    }
  }

  if (changes.threshold !== undefined) {
    if (typeof changes.threshold !== 'number' || !Number.isFinite(changes.threshold)) {
      throw new HttpError(400, 'threshold must be a finite number');
    }
  }

  for (const field of BOOLEAN_FIELDS) {
    if (changes[field] !== undefined && typeof changes[field] !== 'boolean') {
      throw new HttpError(400, `${field} must be a boolean`);
    }
  }

  if (requireCoreFields) {
    if (typeof changes.name !== 'string' || typeof changes.species !== 'string') {
      throw new HttpError(400, 'name and species are required');
    }
    if (typeof changes.threshold !== 'number' || !Number.isFinite(changes.threshold)) {
      throw new HttpError(400, 'threshold must be a finite number');
    }
  }

  return changes;
}

async function listForUser(userId) {
  const plants = await plantModel.findAllByUserId(Number(userId));
  return plantInformationService.enrichMany(plants);
}

async function searchForUser(rawQuery, rawLimit, userId) {
  if (typeof rawQuery !== 'string' || rawQuery.trim().length === 0) {
    throw new HttpError(400, 'A non-empty q search parameter is required');
  }

  const query = rawQuery.trim();
  if (query.length > 100) {
    throw new HttpError(400, 'Search query must be 100 characters or fewer');
  }

  const limit = rawLimit === undefined ? 50 : Number(rawLimit);
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw new HttpError(400, 'limit must be an integer between 1 and 100');
  }

  const escapedQuery = query.replace(/[!%_]/g, '!$&');
  const pattern = `%${escapedQuery}%`;
  const plants = await plantModel.searchByUserId(Number(userId), pattern, limit);
  return plantInformationService.enrichMany(plants);
}

async function getForUser(rawId, userId) {
  const plant = await plantModel.findByIdForUser(parsePlantId(rawId), Number(userId));
  if (!plant) {
    throw new HttpError(404, 'Plant not found');
  }
  return plantInformationService.enrichOne(plant);
}

async function getAutomaticWateringDecision(rawId, userId) {
  const plant = await getForUser(rawId, userId);
  return {
    wateringNeeded: isAutomaticWateringNeeded(plant)
  };
}

function isAutomaticWateringNeeded(plant, moisture = plant.moisture) {
  return Boolean(plant.autoMode && moisture !== null && moisture < plant.threshold);
}

async function createForUser(input, userId) {
  const plant = validateFields(input, { requireCoreFields: true });
  const id = await plantModel.create({
    ...plant,
    userId: Number(userId)
  });
  return getForUser(id, userId);
}

async function updateForUser(rawId, input, userId) {
  const id = parsePlantId(rawId);
  await getForUser(id, userId);
  const changes = validateFields(input);
  await plantModel.updateForUser(id, Number(userId), changes);
  return getForUser(id, userId);
}

async function deleteForUser(rawId, userId) {
  const id = parsePlantId(rawId);
  const result = await plantModel.deleteForUser(id, Number(userId));
  if (result.changes === 0) {
    throw new HttpError(404, 'Plant not found');
  }
}

module.exports = {
  listForUser,
  searchForUser,
  getForUser,
  getAutomaticWateringDecision,
  isAutomaticWateringNeeded,
  createForUser,
  updateForUser,
  deleteForUser
};
