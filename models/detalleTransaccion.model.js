module.exports = (sequelize, DataTypes) => {
  const Detalle = sequelize.define('detalleTransaccion', {
    tipo: {
      type: DataTypes.ENUM('debe', 'haber'),
      allowNull: false
    },
    monto: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    }
  });

  // ✅ Asociaciones necesarias para mostrar bien la cuenta en los detalles
  Detalle.associate = models => {
    Detalle.belongsTo(models.cuenta, { foreignKey: 'cuentaId' });
    Detalle.belongsTo(models.transaccion, { foreignKey: 'transaccionId' });
  };

  return Detalle;
};