const asyncHandler = require('../utils/asyncHandler');
const productService = require('../services/productService');

const getProducts = asyncHandler(async (req, res) => {
  const { category, search, page, limit } = req.query;
  const result = await productService.listProducts({
    categoryId: category,
    search,
    page: page ? Number(page) : 1,
    limit: limit ? Number(limit) : 20,
  });
  res.json({ success: true, ...result });
});

const getProduct = asyncHandler(async (req, res) => {
  const product = await productService.getProductById(req.params.id);
  res.json({ success: true, data: product });
});

const getCategories = asyncHandler(async (req, res) => {
  const categories = await productService.listCategories();
  res.json({ success: true, data: categories });
});

// เช็กราคาสินค้า (server-side re-pricing of a cart payload)
const priceCart = asyncHandler(async (req, res) => {
  const { items } = req.body;
  const result = await productService.priceCart(items);
  res.json({ success: true, data: result });
});

module.exports = { getProducts, getProduct, getCategories, priceCart };
