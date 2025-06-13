module.exports = (sequelize, DataTypes) => {
  const Ejercicio = sequelize.define('ejercicio', {
    anio: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      validate: {
        min: 2000,
        max: 2100
      }
    },
    descripcion: {
      type: DataTypes.STRING,
      allowNull: true
    },
    activo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'ejercicios',
    timestamps: true
  });

  return Ejercicio;
};