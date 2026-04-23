const Joi = require('joi');

const formationSchema = Joi.object({
  titre: Joi.string().required().min(3).max(100),
  description: Joi.string().optional().allow(''),
  prix: Joi.number().optional().min(0),
  duree: Joi.number().optional().min(0),
  centreId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
  categorieId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
  requiredSkills: Joi.array().items(Joi.string().regex(/^[0-9a-fA-F]{24}$/)).optional(),
});

module.exports = {
  formationSchema,
};
