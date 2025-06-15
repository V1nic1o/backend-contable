module.exports = (sequelize, DataTypes) => {
  const DetalleResumen = sequelize.define('detalleResumen', {
    tipo: {
      type: DataTypes.ENUM('debe', 'haber'),
      allowNull: false
    },
    monto: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    }
  }, {
    tableName: 'detalleResumen' // 👈 forzamos nombre exacto de tabla
  });

  DetalleResumen.associate = (models) => {
    DetalleResumen.belongsTo(models.transacciones, {
      foreignKey: 'transaccionId',
      as: 'resumenTransaccion'
    });

    DetalleResumen.belongsTo(models.cuentas, {
      foreignKey: 'cuentaId',
      as: 'cuentaResumen'
    });
  };

  return DetalleResumen;
};