const router = require('express').Router();
const { verifyToken, requireRole } = require('../middleware/auth.middleware');
const { validate, productSchema } = require('../middleware/validate');
const ctrl = require('../controllers/productController');

router.get('/',                ctrl.getAll);
router.get('/:id',             ctrl.getOne);
router.post('/',               verifyToken, requireRole('admin'), validate(productSchema), ctrl.create);
router.put('/:id',             verifyToken, requireRole('admin'), validate(productSchema), ctrl.update);
router.delete('/:id',          verifyToken, requireRole('admin'), ctrl.remove);
router.patch('/:id/stock',     verifyToken, requireRole('admin'), ctrl.updateStock);

module.exports = router;
