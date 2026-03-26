const router = require('express').Router();
const { verifyToken, requireRole } = require('../middleware/auth.middleware');
const ctrl = require('../controllers/orderController');

router.use(verifyToken);

router.post('/checkout',        ctrl.checkout);
router.get('/',                 ctrl.getAll);
router.get('/:id',              ctrl.getOne);
router.patch('/:id/status',     requireRole('admin'), ctrl.updateStatus);

module.exports = router;
