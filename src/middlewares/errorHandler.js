const { buildUploadedImagePath, removeStoredImage } = require('../services/uploadService');

function notFound(req, res) {
  res.status(404).json({
    message: 'Ruta no encontrada'
  });
}

async function errorHandler(error, req, res, next) {
  if (req.file?.filename) {
    await removeStoredImage(buildUploadedImagePath(req.file.filename)).catch(() => {});
  }

  let statusCode = error.status || 500;
  const payload = {
    message: error.message || 'Error interno del servidor'
  };

  if (error.name === 'MulterError' && error.code === 'LIMIT_FILE_SIZE') {
    statusCode = 400;
    payload.message = 'La imagen supera el tamaño permitido';
  }

  if (error.details) {
    payload.details = error.details;
  }

  if (process.env.NODE_ENV !== 'production' && statusCode >= 500) {
    payload.error = error.name;
  }

  res.status(statusCode).json(payload);
}

module.exports = {
  notFound,
  errorHandler
};