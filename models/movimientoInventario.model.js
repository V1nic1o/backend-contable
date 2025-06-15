// models/movimientoInventario.model.js
module.exports = (sequelize, DataTypes) => {
  const MovimientoInventario = sequelize.define('movimientoInventario', {
    tipo: {
      type: DataTypes.ENUM('entrada', 'salida', 'ajuste'),
      allowNull: false
    },
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    observacion: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    fecha: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  });

  MovimientoInventario.associate = (models) => {
    MovimientoInventario.belongsTo(models.producto, {
      foreignKey: 'productoId',
      as: 'producto'
    });

    // ✅ Corrección aquí: usar el nombre correcto del modelo (transaccion)
    MovimientoInventario.belongsTo(models.transaccion, {
      foreignKey: {
        name: 'transaccionId',
        allowNull: true
      },
      as: 'transaccion'
    });
  };

  return MovimientoInventario;
};