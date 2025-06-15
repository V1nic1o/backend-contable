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
db.ejercicios = require('./ejercicio.model')(sequelize, Sequelize);

// Modelo adicional para dashboard
db.detalleResumen = require('./detalleResumen.model')(sequelize, Sequelize);

// Modelos inventario
db.producto = require('./producto.model')(sequelize, Sequelize);
db.movimientoInventario = require('./movimientoInventario.model')(sequelize, Sequelize);

// Modelos planilla e IGSS
db.empleado = require('./empleado.model')(sequelize, Sequelize);
db.planilla = require('./planilla.model')(sequelize, Sequelize);
db.detallePlanilla = require('./detallePlanilla.model')(sequelize, Sequelize);

// Modelos de conciliaciones
db.ConciliacionBancaria = require('./conciliacionBancaria.model')(sequelize, Sequelize);
db.MovimientoConciliado = require('./movimientoConciliado.model')(sequelize, Sequelize);

// Asociaciones de conciliaciones
if (db.ConciliacionBancaria.associate) db.ConciliacionBancaria.associate(db);
if (db.MovimientoConciliado.associate) db.MovimientoConciliado.associate(db);
if (db.detalleResumen.associate) db.detalleResumen.associate(db);

// Relaciones estándar
db.transacciones.hasMany(db.detallesTransaccion, {
  as: 'detalles',
  foreignKey: 'transaccionId',
  onDelete: 'CASCADE'
});
db.detallesTransaccion.belongsTo(db.transacciones, {
  foreignKey: 'transaccionId'
});

db.cuentas.hasMany(db.detallesTransaccion, {
  as: 'movimientos',
  foreignKey: 'cuentaId',
  onDelete: 'SET NULL'
});
db.detallesTransaccion.belongsTo(db.cuentas, {
  foreignKey: 'cuentaId'
});

db.usuarios.hasMany(db.auditorias, {
  foreignKey: 'usuarioId',
  as: 'acciones'
});
db.auditorias.belongsTo(db.usuarios, {
  foreignKey: 'usuarioId',
  as: 'usuario'
});

db.ejercicios.hasMany(db.transacciones, {
  foreignKey: 'ejercicioId',
  as: 'transacciones'
});
db.transacciones.belongsTo(db.ejercicios, {
  foreignKey: 'ejercicioId',
  as: 'ejercicio'
});

db.producto.hasMany(db.movimientoInventario, {
  foreignKey: 'productoId',
  as: 'movimientos'
});
db.movimientoInventario.belongsTo(db.producto, {
  foreignKey: 'productoId',
  as: 'producto'
});

db.transacciones.hasMany(db.movimientoInventario, {
  foreignKey: 'transaccionId',
  as: 'movimientosInventario'
});
db.movimientoInventario.belongsTo(db.transacciones, {
  foreignKey: 'transaccionId',
  as: 'transaccion'
});

db.planilla.hasMany(db.detallePlanilla, {
  foreignKey: 'planillaId',
  as: 'detalles'
});
db.detallePlanilla.belongsTo(db.planilla, {
  foreignKey: 'planillaId',
  as: 'planilla'
});

db.empleado.hasMany(db.detallePlanilla, {
  foreignKey: 'empleadoId',
  as: 'detallesPlanilla'
});
db.detallePlanilla.belongsTo(db.empleado, {
  foreignKey: 'empleadoId',
  as: 'empleado'
});

// Relaciones específicas para el resumen contable (dashboard)
db.transacciones.hasMany(db.detalleResumen, {
  foreignKey: 'transaccionId',
  as: 'resumenDetalles' // debe coincidir con controlador
});
// 🔴 No repetir estas asociaciones si ya están definidas en detalleResumen.model.js:
// db.detalleResumen.belongsTo(db.transacciones, { foreignKey: 'transaccionId', as: 'resumenTransaccion' });
// db.detalleResumen.belongsTo(db.cuentas, { foreignKey: 'cuentaId', as: 'cuentaResumen' });

module.exports = db;