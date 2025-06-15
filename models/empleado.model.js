module.exports = (sequelize, DataTypes) => {
  const Empleado = sequelize.define('empleado', {
    nombres: {
      type: DataTypes.STRING,
      allowNull: false
    },
    apellidos: {
      type: DataTypes.STRING,
      allowNull: false
    },
    dpi: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    puesto: {
      type: DataTypes.STRING,
      allowNull: true
    },
    salarioBase: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    bonificacion: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 250
    },
    estado: {
      type: DataTypes.STRING,
      defaultValue: 'activo'
    }
  });

  Empleado.associate = (models) => {
    Empleado.hasMany(models.detallePlanilla, {
      foreignKey: 'empleadoId',
      as: 'detallesPlanilla'
    });
  };

  return Empleado;
};