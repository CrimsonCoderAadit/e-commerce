const Joi = require('joi');

const orderSchema = Joi.object({
  userId: Joi.string().required(),
  userEmail: Joi.string().email().required(),
  items: Joi.array()
    .items(
      Joi.object({
        productId: Joi.string().required(),
        name: Joi.string().required(),
        price: Joi.number().min(0).required(),
        quantity: Joi.number().integer().min(1).required(),
      })
    )
    .min(1)
    .required(),
  shippingAddress: Joi.object({
    street: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    zip: Joi.string().required(),
    country: Joi.string().required(),
  }).required(),
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

module.exports = { validate, orderSchema };
