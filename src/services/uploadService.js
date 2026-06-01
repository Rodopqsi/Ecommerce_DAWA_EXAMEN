const fs = require('fs');
const fsPromises = require('fs/promises');
const path = require('path');
const multer = require('multer');

const uploadsDirectory = path.join(__dirname, '..', '..', 'public', 'uploads');

fs.mkdirSync(uploadsDirectory, { recursive: true });

function normalizeName(value) {
  return String(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'imagen';
}

function buildFileName(file) {
  const extension = path.extname(file.originalname || '').toLowerCase() || '.jpg';
  const baseName = normalizeName(path.basename(file.originalname || 'imagen', extension));
  return `${Date.now()}-${Math.round(Math.random() * 1e9)}-${baseName}${extension}`;
}

function fileFilter(req, file, callback) {
  if (!file.mimetype.startsWith('image/')) {
    const error = new Error('Solo se permiten archivos de imagen');
    error.status = 400;
    callback(error);
    return;
  }

  callback(null, true);
}

const storage = multer.diskStorage({
  destination(req, file, callback) {
    callback(null, uploadsDirectory);
  },
  filename(req, file, callback) {
    callback(null, buildFileName(file));
  }
});

const productImageUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

function buildUploadedImagePath(fileName) {
  return `/uploads/${fileName}`;
}

function isStoredImagePath(imageUrl) {
  return typeof imageUrl === 'string' && imageUrl.startsWith('/uploads/');
}

async function removeStoredImage(imageUrl) {
  if (!isStoredImagePath(imageUrl)) {
    return;
  }

  const filePath = path.join(uploadsDirectory, path.basename(imageUrl));
  await fsPromises.unlink(filePath).catch((error) => {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  });
}

module.exports = {
  buildUploadedImagePath,
  isStoredImagePath,
  productImageUpload,
  removeStoredImage
};