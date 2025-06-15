module.exports = (sequelize, DataTypes) => {
  const DetallePlanilla = sequelize.define('detallePlanilla', {
    salario: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    bonificacion: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    igssLaboral: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    igssPatronal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    totalAPagar: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    }
  });

  DetallePlanilla.associate = (models) => {
    DetallePlanilla.belongsTo(models.empleado, {
      foreignKey: 'empleadoId',
      as: 'empleado'
    });

    DetallePlanilla.belongsTo(models.planilla, {
      foreignKey: 'planillaId',
      as: 'planilla'
    });
  };

  return DetallePlanilla;
};