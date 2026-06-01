const { buildUploadedImagePath, removeStoredImage } = require('../services/uploadService');

function validate(schema) {
  return async (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      if (req.file?.filename) {
        await removeStoredImage(buildUploadedImagePath(req.file.filename)).catch(() => {});
      }

      return res.status(400).json({
        message: 'Datos inválidos',
        details: error.details.map((detail) => detail.message)
      });
    }

    req.body = value;
    next();
  };
}

module.exports = validate;