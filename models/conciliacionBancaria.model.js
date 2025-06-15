module.exports = (sequelize, DataTypes) => {
  const ConciliacionBancaria = sequelize.define('ConciliacionBancaria', {
    banco: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fecha: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    saldoInicial: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    saldoFinal: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    saldoContable: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    numeroCheque: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    referenciaBancaria: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    montoSistema: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    montoBanco: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    estado: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'pendiente', // o "conciliado"
    },
    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true,
    }
  });

  ConciliacionBancaria.associate = models => {
    ConciliacionBancaria.hasMany(models.MovimientoConciliado, {
      foreignKey: 'conciliacionId',
      as: 'movimientos'
    });
  };

  return ConciliacionBancaria;
};