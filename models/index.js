const { Sequelize } = require('sequelize');
const dbConfig = require('../config/db.config');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      }
    }
  }
);

// Verificamos la conexión
sequelize.authenticate()
  .then(() => console.log('✅ Conexión a la base de datos exitosa.'))
  .catch(err => console.error('❌ Error al conectar con la base de datos:', err));

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Modelos base
db.usuarios = require('./usuario.model')(sequelize, Sequelize);
db.cuentas = require('./cuenta.model')(sequelize, Sequelize);
db.transacciones = require('./transaccion.model')(sequelize, Sequelize);
db.detallesTransaccion = require('./detalleTransaccion.model')(sequelize, Sequelize);
db.auditorias = require('./auditoria.model')(sequelize, Sequelize);
db.ejercicios = require('./ejercicio.model')(sequelize, Sequelize); // ✅ NUEVO

// Relaciones

// Transacción → Detalles
db.transacciones.hasMany(db.detallesTransaccion, {
  as: 'detalles',
  foreignKey: 'transaccionId',
  onDelete: 'CASCADE'
});
db.detallesTransaccion.belongsTo(db.transacciones, {
  foreignKey: 'transaccionId'
});

// Cuenta → Detalles
db.cuentas.hasMany(db.detallesTransaccion, {
  as: 'movimientos',
  foreignKey: 'cuentaId',
  onDelete: 'SET NULL'
});
db.detallesTransaccion.belongsTo(db.cuentas, {
  foreignKey: 'cuentaId'
});

// Auditoría → Usuario
db.usuarios.hasMany(db.auditorias, {
  foreignKey: 'usuarioId',
  as: 'acciones'
});
db.auditorias.belongsTo(db.usuarios, {
  foreignKey: 'usuarioId',
  as: 'usuario'
});

// Ejercicio → Transacciones
db.ejercicios.hasMany(db.transacciones, {
  foreignKey: 'ejercicioId',
  as: 'transacciones'
});
db.transacciones.belongsTo(db.ejercicios, {
  foreignKey: 'ejercicioId',
  as: 'ejercicio'
});

module.exports = db;