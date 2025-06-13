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

  return Detalle;
};