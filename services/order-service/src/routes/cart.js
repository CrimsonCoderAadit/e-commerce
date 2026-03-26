const router = require('express').Router();
const { verifyToken } = require('../middleware/auth.middleware');
const ctrl = require('../controllers/cartController');

router.use(verifyToken);

router.get('/',         ctrl.getCart);
router.post('/add',     ctrl.addItem);
router.post('/update',  ctrl.updateItem);
router.post('/remove',  ctrl.removeItem);
router.delete('/clear', ctrl.clearCart);

module.exports = router;
