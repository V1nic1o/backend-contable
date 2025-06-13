const db = require('../models');
const Cuenta = db.cuentas;
const Detalle = db.detallesTransaccion;
const { generarPDF } = require('../services/pdfGenerator');

exports.balanceGeneral = async (req, res) => {
  try {
    // Obtener todas las cuentas clasificadas por tipo
    const cuentas = await Cuenta.findAll({
      include: {
        model: Detalle,
        as: 'movimientos',
        attributes: ['tipo', 'monto']
      }
    });

    let activos = 0;
    let pasivos = 0;
    let patrimonio = 0;

    for (const cuenta of cuentas) {
      let total = 0;

      for (const movimiento of cuenta.movimientos) {
        const monto = parseFloat(movimiento.monto);
        if (movimiento.tipo === 'debe') total += monto;
        else if (movimiento.tipo === 'haber') total -= monto;
      }

      if (cuenta.tipo === 'activo') activos += total;
      else if (cuenta.tipo === 'pasivo') pasivos += total;
      else if (cuenta.tipo === 'patrimonio') patrimonio += total;
    }

    res.json({
      activos: activos.toFixed(2),
      pasivos: pasivos.toFixed(2),
      patrimonio: patrimonio.toFixed(2),
      formula: `Activos = Pasivos + Patrimonio`,
      equilibrio: (activos.toFixed(2) === (pasivos + patrimonio).toFixed(2))
    });

  } catch (err) {
    res.status(500).json({ mensaje: 'Error al generar balance general', error: err.message });
  }
};

exports.estadoResultados = async (req, res) => {
  try {
    const cuentas = await Cuenta.findAll({
      include: {
        model: Detalle,
        as: 'movimientos',
        attributes: ['tipo', 'monto']
      }
    });

    let ingresos = 0;
    let gastos = 0;

    for (const cuenta of cuentas) {
      let total = 0;

      for (const movimiento of cuenta.movimientos) {
        const monto = parseFloat(movimiento.monto);
        if (movimiento.tipo === 'haber') total += monto;
        else if (movimiento.tipo === 'debe') total -= monto;
      }

      if (cuenta.tipo === 'ingreso') ingresos += total;
      else if (cuenta.tipo === 'gasto') gastos += total;
    }

    const resultado = ingresos - gastos;

    res.json({
      ingresos: ingresos.toFixed(2),
      gastos: gastos.toFixed(2),
      resultado: resultado.toFixed(2),
      tipo: resultado >= 0 ? 'Utilidad Neta' : 'Pérdida Neta'
    });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al generar estado de resultados', error: err.message });
  }
};

exports.libroDiario = async (req, res) => {
  try {
    const transacciones = await db.transacciones.findAll({
      include: {
        model: db.detallesTransaccion,
        as: 'detalles',
        include: {
          model: db.cuentas,
          attributes: ['codigo', 'nombre']
        }
      },
      order: [['fecha', 'ASC'], ['id', 'ASC']]
    });

    const libro = transacciones.map(tx => ({
      fecha: tx.fecha,
      descripcion: tx.descripcion,
      detalles: tx.detalles.map(d => ({
        cuenta: `${d.cuenta.codigo} - ${d.cuenta.nombre}`,
        tipo: d.tipo,
        monto: parseFloat(d.monto).toFixed(2)
      }))
    }));

    res.json(libro);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al generar libro diario', error: err.message });
  }
};

exports.pdfBalanceGeneral = async (req, res) => {
  try {
    const { activos, pasivos, patrimonio, equilibrio } = await getBalanceInterno();

    generarPDF('Balance General', (doc) => {
      doc.text(`Activos: Q${activos}`);
      doc.text(`Pasivos: Q${pasivos}`);
      doc.text(`Patrimonio: Q${patrimonio}`);
      doc.text(`Resultado: ${equilibrio ? 'Balanceado' : 'Desequilibrado'}`);
    }, res);

  } catch (err) {
    res.status(500).json({ mensaje: 'Error al generar PDF', error: err.message });
  }
};

const getBalanceInterno = async () => {
  const cuentas = await Cuenta.findAll({ include: { model: Detalle, as: 'movimientos' } });
  let activos = 0, pasivos = 0, patrimonio = 0;

  for (const cuenta of cuentas) {
    let total = 0;
    for (const m of cuenta.movimientos) {
      total += m.tipo === 'debe' ? parseFloat(m.monto) : -parseFloat(m.monto);
    }
    if (cuenta.tipo === 'activo') activos += total;
    else if (cuenta.tipo === 'pasivo') pasivos += total;
    else if (cuenta.tipo === 'patrimonio') patrimonio += total;
  }

  return {
    activos: activos.toFixed(2),
    pasivos: pasivos.toFixed(2),
    patrimonio: patrimonio.toFixed(2),
    equilibrio: activos.toFixed(2) === (pasivos + patrimonio).toFixed(2)
  };
};

exports.pdfEstadoResultados = async (req, res) => {
  try {
    const cuentas = await Cuenta.findAll({ include: { model: Detalle, as: 'movimientos' } });
    let ingresos = 0, gastos = 0;

    for (const cuenta of cuentas) {
      let total = 0;
      for (const m of cuenta.movimientos) {
        total += m.tipo === 'haber' ? parseFloat(m.monto) : -parseFloat(m.monto);
      }
      if (cuenta.tipo === 'ingreso') ingresos += total;
      else if (cuenta.tipo === 'gasto') gastos += total;
    }

    const resultado = ingresos - gastos;

    generarPDF('Estado de Resultados', (doc) => {
      doc.text(`Ingresos: Q${ingresos.toFixed(2)}`);
      doc.text(`Gastos: Q${gastos.toFixed(2)}`);
      doc.text(`Resultado: ${resultado >= 0 ? 'Utilidad Neta' : 'Pérdida Neta'} (Q${resultado.toFixed(2)})`);
    }, res);

  } catch (err) {
    res.status(500).json({ mensaje: 'Error al generar PDF', error: err.message });
  }
};

exports.pdfLibroDiario = async (req, res) => {
  try {
    const transacciones = await db.transacciones.findAll({
      include: {
        model: db.detallesTransaccion,
        as: 'detalles',
        include: {
          model: db.cuentas,
          attributes: ['codigo', 'nombre']
        }
      },
      order: [['fecha', 'ASC']]
    });

    generarPDF('Libro Diario', (doc) => {
      transacciones.forEach(tx => {
        doc.fontSize(12).text(`📅 ${tx.fecha} - ${tx.descripcion}`);
        tx.detalles.forEach(d => {
          const cuenta = `${d.cuenta.codigo} - ${d.cuenta.nombre}`;
          doc.text(`  ${cuenta} | ${d.tipo.toUpperCase()} | Q${parseFloat(d.monto).toFixed(2)}`);
        });
        doc.moveDown(0.5);
      });
    }, res);

  } catch (err) {
    res.status(500).json({ mensaje: 'Error al generar PDF', error: err.message });
  }
};