require('dotenv').config();

const app = require('./app');
const { initializeDatabase } = require('./config/db');

const port = Number(process.env.PORT || 3000);

function formatStartupError(error) {
  if (!error) {
    return 'Error no identificado';
  }

  if (Array.isArray(error.errors) && error.errors.length) {
    return error.errors.map((item) => item.message).join(' | ');
  }

  return error.message || String(error);
}

async function startServer() {
  await initializeDatabase();

  app.listen(port, () => {
    console.log(`Servidor activo en el puerto ${port}`);
  });
}

startServer().catch((error) => {
  console.error('No fue posible iniciar la aplicación:', formatStartupError(error));
  process.exit(1);
});