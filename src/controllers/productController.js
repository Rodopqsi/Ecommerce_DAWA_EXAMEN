const {
  findAllProducts,
  findProductById,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../models/productModel');
const { fetchProductImage } = require('../services/imageService');
const { buildUploadedImagePath, isStoredImagePath, removeStoredImage } = require('../services/uploadService');

function parseProductId(id) {
  const productId = Number(id);

  if (!Number.isInteger(productId) || productId <= 0) {
    const error = new Error('El identificador del producto es inválido');
    error.status = 400;
    throw error;
  }

  return productId;
}

async function getProducts(req, res) {
  const products = await findAllProducts();
  res.json(products);
}

function resolveImageUrl(req, fallbackImageUrl = '') {
  if (req.file?.filename) {
    return buildUploadedImagePath(req.file.filename);
  }

  const imageUrl = typeof req.body.image_url === 'string' ? req.body.image_url.trim() : '';

  if (imageUrl) {
    return imageUrl;
  }

  return fallbackImageUrl;
}

async function getProductById(req, res) {
  const productId = parseProductId(req.params.id);
  const product = await findProductById(productId);

  if (!product) {
    return res.status(404).json({
      message: 'Producto no encontrado'
    });
  }

  return res.json(product);
}

async function createProductEntry(req, res) {
  const image_url = resolveImageUrl(req) || (await fetchProductImage(req.body.name));
  const product = await createProduct({
    ...req.body,
    image_url
  });

  res.status(201).json(product);
}

async function updateProductEntry(req, res) {
  const productId = parseProductId(req.params.id);
  const currentProduct = await findProductById(productId);

  if (!currentProduct) {
    return res.status(404).json({
      message: 'Producto no encontrado'
    });
  }

  const nextImageUrl = resolveImageUrl(req, currentProduct.image_url);
  const product = await updateProduct(productId, {
    ...req.body,
    image_url: nextImageUrl
  });

  if (isStoredImagePath(currentProduct.image_url) && currentProduct.image_url !== nextImageUrl) {
    await removeStoredImage(currentProduct.image_url).catch(() => {});
  }

  return res.json(product);
}

async function deleteProductEntry(req, res) {
  const productId = parseProductId(req.params.id);
  const currentProduct = await findProductById(productId);

  if (!currentProduct) {
    return res.status(404).json({
      message: 'Producto no encontrado'
    });
  }

  await deleteProduct(productId);

  if (isStoredImagePath(currentProduct.image_url)) {
    await removeStoredImage(currentProduct.image_url).catch(() => {});
  }

  return res.status(204).send();
}

module.exports = {
  getProducts,
  getProductById,
  createProduct: createProductEntry,
  updateProduct: updateProductEntry,
  deleteProduct: deleteProductEntry
};