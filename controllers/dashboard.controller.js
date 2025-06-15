const db = require('../models');
const Transaccion = db.transacciones;
const DetalleResumen = db.detalleResumen;
const Cuenta = db.cuentas;
const { Op } = require('sequelize');

exports.obtenerResumenContable = async (req, res) => {
  try {
    const { ejercicioId } = req.query;
    if (!ejercicioId) {
      return res.status(400).json({ mensaje: 'Debe proporcionar ejercicioId' });
    }

    const transacciones = await Transaccion.findAll({
      where: { ejercicioId },
      include: [
        {
          model: DetalleResumen,
          as: 'resumenDetalles', // ✅ debe coincidir con hasMany en index.js
          include: [
            {
              model: Cuenta,
              attributes: ['tipo'],
              as: 'cuentaResumen' // ✅ alias definido en detalleResumen.model.js
            }
          ]
        }
      ]
    });

    let totalIngresos = 0;
    let totalEgresos = 0;

    transacciones.forEach(t => {
      t.resumenDetalles.forEach(d => {
        const monto = parseFloat(d.monto);
        if (!d.cuentaResumen || isNaN(monto)) return;

        if (d.tipo === 'debe' && d.cuentaResumen.tipo === 'egreso') {
          totalEgresos += monto;
        }

        if (d.tipo === 'haber' && d.cuentaResumen.tipo === 'ingreso') {
          totalIngresos += monto;
        }
      });
    });

    res.json({
      ingresos: totalIngresos,
      egresos: totalEgresos,
      balance: totalIngresos - totalEgresos
    });

  } catch (err) {
    console.error('❌ Error en resumen contable:', err.message);
    res.status(500).json({ mensaje: 'Error al obtener resumen', error: err.message });
  }
};

exports.obtenerDetallePorTipo = async (req, res) => {
  try {
    const { ejercicioId, tipo } = req.query;

    if (!ejercicioId || !['ingreso', 'egreso'].includes(tipo)) {
      return res.status(400).json({ mensaje: 'Parámetros inválidos.' });
    }

    // Mapear tipo esperado desde frontend a tipo real en la tabla
    const tipoMovimiento = tipo === 'ingreso' ? 'haber' : 'debe';

    const transacciones = await db.transacciones.findAll({
      where: { ejercicioId },
      include: [{
        model: db.detalleResumen,
        as: 'resumenDetalles',
        where: { tipo: tipoMovimiento },
        include: [{
          model: db.cuentas,
          as: 'cuentaResumen',
          attributes: ['codigo', 'nombre', 'tipo']
        }]
      }],
      order: [['fecha', 'DESC']]
    });

    const resultados = transacciones.flatMap(tx =>
      tx.resumenDetalles.map(det => ({
        fecha: tx.fecha,
        descripcion: tx.descripcion,
        cuenta: det.cuentaResumen?.nombre,
        codigo: det.cuentaResumen?.codigo,
        tipoCuenta: det.cuentaResumen?.tipo,
        tipo: det.tipo,
        monto: parseFloat(det.monto)
      }))
    );

    res.json(resultados);
  } catch (err) {
    console.error('❌ Error en detalle por tipo:', err);
    res.status(500).json({ mensaje: 'Error al obtener detalle', error: err.message });
  }
};