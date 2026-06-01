const axios = require('axios');

function normalizeSeed(value) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'product';
}

function buildFallbackImageUrl(name) {
  return `https://picsum.photos/seed/${normalizeSeed(name)}/900/700`;
}

async function fetchProductImage(name) {
  try {
    const response = await axios.get('https://dummyjson.com/products/search', {
      params: { q: name },
      timeout: 5000
    });

    const product = (response.data.products || []).find((item) => item.thumbnail || item.images?.length);

    if (product?.thumbnail) {
      return product.thumbnail;
    }

    if (product?.images?.length) {
      return product.images[0];
    }
  } catch (error) {
    return buildFallbackImageUrl(name);
  }

  return buildFallbackImageUrl(name);
}

module.exports = {
  fetchProductImage
};