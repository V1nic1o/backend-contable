module.exports = (sequelize, DataTypes) => {
  const Transaccion = sequelize.define('transaccion', {
    fecha: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    descripcion: {
      type: DataTypes.STRING,
      allowNull: false
    }
  });

  Transaccion.associate = (models) => {
    // Relación con detalles contables
    Transaccion.hasMany(models.detallesTransaccion, {
      foreignKey: 'transaccionId',
      as: 'detalles'
    });

    // Relación con movimientos de inventario
    Transaccion.hasMany(models.movimientoInventario, {
      foreignKey: 'transaccionId',
      as: 'movimientosInventario'
    });
  };

  return Transaccion;
};