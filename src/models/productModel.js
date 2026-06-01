const { pool } = require('../config/db');

const selectableFields = 'id, name, description, price, stock, image_url';
const updatableFields = ['name', 'description', 'price', 'stock', 'image_url'];

async function findAllProducts() {
  const [rows] = await pool.query(`SELECT ${selectableFields} FROM products ORDER BY id DESC`);
  return rows;
}

async function findProductById(id) {
  const [rows] = await pool.query(`SELECT ${selectableFields} FROM products WHERE id = ?`, [id]);
  return rows[0] || null;
}

async function createProduct(product) {
  const { name, description, price, stock, image_url } = product;
  const [result] = await pool.query(
    'INSERT INTO products (name, description, price, stock, image_url) VALUES (?, ?, ?, ?, ?)',
    [name, description, price, stock, image_url]
  );
  return findProductById(result.insertId);
}

async function updateProduct(id, product) {
  const fields = [];
  const values = [];

  updatableFields.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(product, field)) {
      fields.push(`${field} = ?`);
      values.push(product[field]);
    }
  });

  if (!fields.length) {
    return findProductById(id);
  }

  values.push(id);
  await pool.query(`UPDATE products SET ${fields.join(', ')} WHERE id = ?`, values);
  return findProductById(id);
}

async function deleteProduct(id) {
  const [result] = await pool.query('DELETE FROM products WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

module.exports = {
  findAllProducts,
  findProductById,
  createProduct,
  updateProduct,
  deleteProduct
};