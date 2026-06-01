require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

const logger = require('./middlewares/logger');
const productRoutes = require('./routes/productRoutes');
const { notFound, errorHandler } = require('./middlewares/errorHandler');

const app = express();
const publicDirectory = path.join(__dirname, '..', 'public');

app.use(logger);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(publicDirectory));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/products', productRoutes);

app.use((req, res, next) => {
  if (req.method !== 'GET' || req.path.startsWith('/api')) {
    return next();
  }

  return res.sendFile(path.join(publicDirectory, 'index.html'));
});

app.use(notFound);
app.use(errorHandler);

module.exports = app;