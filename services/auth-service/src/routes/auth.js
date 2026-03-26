const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const { validate, registerSchema, loginSchema } = require('../middleware/validate');
const { verifyToken } = require('../middleware/auth.middleware');
const ctrl = require('../controllers/authController');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' },
});

router.post('/register', authLimiter, validate(registerSchema), ctrl.register);
router.post('/login',    authLimiter, validate(loginSchema),    ctrl.login);
router.post('/refresh',                                          ctrl.refresh);
router.post('/logout',                                           ctrl.logout);
router.get('/me',        verifyToken,                            ctrl.me);

module.exports = router;
