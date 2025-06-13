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

  return Transaccion;
};