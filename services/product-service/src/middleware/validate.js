const Joi = require('joi');

const productSchema = Joi.object({
  name: Joi.string().trim().required(),
  description: Joi.string().required(),
  price: Joi.number().min(0.01).required(),
  category: Joi.string().hex().length(24).required(),
  imageUrl: Joi.string().uri().optional().allow(''),
  stock: Joi.number().integer().min(0).default(0),
});

const categorySchema = Joi.object({
  name: Joi.string().trim().required(),
  description: Joi.string().optional().allow(''),
  imageUrl: Joi.string().uri().optional().allow(''),
});

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(422).json({
      error: 'Validation failed',
      details: error.details.map((d) => d.message),
    });
  }
  next();
};

module.exports = { validate, productSchema, categorySchema };
