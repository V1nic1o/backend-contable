module.exports = (sequelize, DataTypes) => {
  const Auditoria = sequelize.define('auditoria', {
    accion: {
      type: DataTypes.ENUM('create', 'update', 'delete'),
      allowNull: false
    },
    entidad: {
      type: DataTypes.STRING,
      allowNull: false
    },
    entidadId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    descripcion: {
      type: DataTypes.STRING,
      allowNull: true
    },
    usuarioId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'auditorias',
    timestamps: true
  });

  return Auditoria;
};