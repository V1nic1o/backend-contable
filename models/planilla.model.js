module.exports = (sequelize, DataTypes) => {
  const Planilla = sequelize.define('planilla', {
    mes: {
      type: DataTypes.STRING,
      allowNull: false // ejemplo: "2025-06"
    },
    descripcion: {
      type: DataTypes.STRING,
      allowNull: true
    }
  });

  Planilla.associate = (models) => {
    Planilla.hasMany(models.detallePlanilla, {
      foreignKey: 'planillaId',
      as: 'detalles'
    });
  };

  return Planilla;
};