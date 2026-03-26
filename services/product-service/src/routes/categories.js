const router = require('express').Router();
const { verifyToken, requireRole } = require('../middleware/auth.middleware');
const { validate, categorySchema } = require('../middleware/validate');
const ctrl = require('../controllers/categoryController');

router.get('/',     ctrl.getAll);
router.post('/',    verifyToken, requireRole('admin'), validate(categorySchema), ctrl.create);
router.delete('/:id', verifyToken, requireRole('admin'), ctrl.remove);

module.exports = router;
