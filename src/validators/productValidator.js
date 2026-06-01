const Joi = require('joi');

const imageUrlSchema = Joi.string().trim().uri({ scheme: ['http', 'https'] }).max(500).allow('');

const createProductSchema = Joi.object({
  name: Joi.string().trim().min(3).max(150).required(),
  description: Joi.string().trim().min(10).max(1200).required(),
  price: Joi.number().positive().precision(2).required(),
  stock: Joi.number().integer().min(0).required(),
  image_url: imageUrlSchema.optional()
});

const updateProductSchema = Joi.object({
  name: Joi.string().trim().min(3).max(150),
  description: Joi.string().trim().min(10).max(1200),
  price: Joi.number().positive().precision(2),
  stock: Joi.number().integer().min(0),
  image_url: imageUrlSchema.optional()
}).min(1);

module.exports = {
  createProductSchema,
  updateProductSchema
};