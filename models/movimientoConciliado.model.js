module.exports = (sequelize, DataTypes) => {
  const MovimientoConciliado = sequelize.define('MovimientoConciliado', {
    fecha: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.STRING,
    },
    monto: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    tipo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    referencia: {
      type: DataTypes.STRING,
    },
    numeroCheque: {
      type: DataTypes.STRING,
    },
    conciliacionId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  });

  MovimientoConciliado.associate = models => {
    MovimientoConciliado.belongsTo(models.ConciliacionBancaria, {
      foreignKey: 'conciliacionId',
      as: 'conciliacion',
      onDelete: 'CASCADE'
    });
  };

  return MovimientoConciliado;
};