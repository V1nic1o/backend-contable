module.exports = (sequelize, DataTypes) => {
  const Cuenta = sequelize.define('cuenta', {
    codigo: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false
    },
    tipo: {
      type: DataTypes.ENUM('activo', 'pasivo', 'patrimonio', 'ingreso', 'egreso','gasto'),
      allowNull: false
    },
    descripcion: {
      type: DataTypes.STRING
    },
    activo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  });

  return Cuenta;
};