const express = require('express');
const productController = require('../controllers/productController');

const router = express.Router();

router.get('/', productController.getProducts);
router.get('/categories', productController.getCategories);
router.post('/price-check', productController.priceCart);
router.get('/:id', productController.getProduct);

module.exports = router;
