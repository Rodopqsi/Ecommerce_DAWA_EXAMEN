const express = require('express');
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
const { productImageUpload } = require('../services/uploadService');
const validate = require('../middlewares/validate');
const { createProductSchema, updateProductSchema } = require('../validators/productValidator');

const router = express.Router();

router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', productImageUpload.single('image_file'), validate(createProductSchema), createProduct);
router.put('/:id', productImageUpload.single('image_file'), validate(updateProductSchema), updateProduct);
router.delete('/:id', deleteProduct);

module.exports = router;