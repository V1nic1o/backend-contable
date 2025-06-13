const db = require('./models');

const app = require('./app');
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor backend corriendo en http://localhost:${PORT}`);
});

db.sequelize.sync({ alter: true }) // crea o actualiza tablas
  .then(() => {
    console.log('📦 Tablas sincronizadas con éxito.');
  })
  .catch(err => {
    console.error('❌ Error al sincronizar la base de datos:', err);
  });