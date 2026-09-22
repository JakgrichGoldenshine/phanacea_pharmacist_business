const express = require('express');
const orderController = require('../controllers/orderController');
const requireAuth = require('../middlewares/requireAuth');

const router = express.Router();

router.get('/', requireAuth, orderController.list);
router.get('/:id', requireAuth, orderController.getOne);

module.exports = router;
