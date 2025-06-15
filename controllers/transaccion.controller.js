const db = require('../models');
const Transaccion = db.transacciones;
const Detalle = db.detallesTransaccion;
const Cuenta = db.cuentas;
const Ejercicio = db.ejercicios;
const { Op } = require('sequelize');
const { registrarAuditoria } = require('../services/auditoriaService');
const { importarDesdeExcel } = require('../services/importacionExcelService');

// ✅ Función interna reutilizable para conciliación automática
exports.buscarTransaccionConciliable = async ({ numeroCheque, referenciaBancaria }) => {
  const condiciones = [];

  if (numeroCheque) {
    condiciones.push({
      descripcion: { [Op.iLike]: `%${numeroCheque}%` }
    });
  }

  if (referenciaBancaria) {
    condiciones.push({
      descripcion: { [Op.iLike]: `%${referenciaBancaria}%` }
    });
  }

  if (condiciones.length === 0) return null;

  const transaccion = await Transaccion.findOne({
    where: {
      [Op.or]: condiciones
    },
    include: {
      model: Detalle,
      as: 'detalles',
      include: {
        model: Cuenta,
        attributes: ['codigo', 'nombre', 'tipo']
      }
    },
    order: [['fecha', 'DESC']]
  });

  return transaccion;
};

exports.crearTransaccion = async (req, res) => {
  const { fecha, descripcion, detalles, ejercicioId } = req.body;

  try {
    if (!fecha || !descripcion || !Array.isArray(detalles) || detalles.length < 2) {
      return res.status(400).json({ mensaje: 'Datos incompletos o inválidos.' });
    }

    const tieneDebe = detalles.some(d => d.tipo === 'debe');
    const tieneHaber = detalles.some(d => d.tipo === 'haber');
    if (!tieneDebe || !tieneHaber) {
      return res.status(400).json({ mensaje: 'Debe incluir al menos un "debe" y un "haber".' });
    }

    if (ejercicioId) {
      const ejercicio = await Ejercicio.findByPk(ejercicioId);
      if (!ejercicio || !ejercicio.activo) {
        return res.status(400).json({ mensaje: 'Ejercicio contable inválido o inactivo' });
      }
    }

    const detallesFormateados = detalles
      .filter(d => d.cuentaId)
      .map(d => ({
        cuentaId: d.cuentaId,
        monto: d.monto,
        tipo: d.tipo
      }));

    const nuevaTransaccion = await Transaccion.create(
      {
        fecha,
        descripcion,
        ejercicioId,
        detalles: detallesFormateados
      },
      { include: [{ model: Detalle, as: 'detalles' }] }
    );

    const resumenDetalles = detallesFormateados.map(d => ({
  cuentaId: d.cuentaId,
  monto: d.monto,
  tipo: d.tipo,
  transaccionId: nuevaTransaccion.id
  }));
  await db.detalleResumen.bulkCreate(resumenDetalles);

    await registrarAuditoria(
      req,
      'create',
      'transaccion',
      nuevaTransaccion.id,
      `Transacción creada (${descripcion})`
    );


    res.status(201).json({ mensaje: 'Transacción registrada correctamente', transaccion: nuevaTransaccion });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al crear transacción', error: err.message });
  }
};

// ✅ Corregido para mostrar siempre los nombres de cuenta
exports.obtenerTransacciones = async (req, res) => {
  try {
    const { desde, hasta, cuentaId, buscar, ejercicioId } = req.query;
    const condiciones = {};

    if (desde || hasta) {
      condiciones.fecha = {};
      if (desde) condiciones.fecha[Op.gte] = desde;
      if (hasta) condiciones.fecha[Op.lte] = hasta;
    }

    if (buscar) {
      condiciones.descripcion = { [Op.iLike]: `%${buscar}%` };
    }

    if (ejercicioId) {
      condiciones.ejercicioId = ejercicioId;
    }

    if (cuentaId) {
      condiciones['$detalles.cuenta.id$'] = cuentaId;
    }

    const transacciones = await Transaccion.findAll({
      where: condiciones,
      include: [
        {
          model: Detalle,
          as: 'detalles',
          include: [
            {
              model: Cuenta,
              attributes: ['codigo', 'nombre', 'tipo'],
              required: false,
              ...(cuentaId && { where: { id: cuentaId } })
            }
          ]
        }
      ],
      order: [['fecha', 'DESC']]
    });

    res.json(transacciones);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al obtener transacciones', error: err.message });
  }
};

exports.importarDesdeExcelController = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ mensaje: 'No se recibió ningún archivo.' });
    }

    const resultados = await importarDesdeExcel(req.file.buffer, req);

    res.status(201).json({
      mensaje: `✅ Se importaron ${resultados.length} transacciones correctamente.`,
      transacciones: resultados
    });
  } catch (err) {
    res.status(500).json({ mensaje: '❌ Error al importar transacciones', error: err.message });
  }
};

exports.buscarPorChequeOReferencia = async (req, res) => {
  try {
    const { numeroCheque, referenciaBancaria } = req.query;

    const condiciones = [];

    if (numeroCheque) {
      condiciones.push({
        descripcion: { [Op.iLike]: `%${numeroCheque}%` }
      });
    }

    if (referenciaBancaria) {
      condiciones.push({
        descripcion: { [Op.iLike]: `%${referenciaBancaria}%` }
      });
    }

    const transacciones = await Transaccion.findAll({
      where: {
        [Op.or]: condiciones
      },
      include: {
        model: Detalle,
        as: 'detalles',
        include: {
          model: Cuenta,
          attributes: ['codigo', 'nombre', 'tipo']
        }
      },
      order: [['fecha', 'DESC']]
    });

    res.json(transacciones);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al buscar transacciones', error: err.message });
  }
};

exports.actualizarTransaccion = async (req, res) => {
  const { id } = req.params;
  const { fecha, descripcion, ejercicioId, detalles } = req.body;

  try {
    const transaccion = await Transaccion.findByPk(id, {
      include: { model: Detalle, as: 'detalles' }
    });

    if (!transaccion) {
      return res.status(404).json({ mensaje: 'Transacción no encontrada' });
    }

    if (!fecha || !descripcion || !Array.isArray(detalles) || detalles.length < 2) {
      return res.status(400).json({ mensaje: 'Datos incompletos o inválidos.' });
    }

    const tieneDebe = detalles.some(d => d.tipo === 'debe');
    const tieneHaber = detalles.some(d => d.tipo === 'haber');
    if (!tieneDebe || !tieneHaber) {
      return res.status(400).json({ mensaje: 'Debe incluir al menos un "debe" y un "haber".' });
    }

    if (ejercicioId) {
      const ejercicio = await Ejercicio.findByPk(ejercicioId);
      if (!ejercicio || !ejercicio.activo) {
        return res.status(400).json({ mensaje: 'Ejercicio contable inválido o inactivo' });
      }
    }

    await transaccion.update({ fecha, descripcion, ejercicioId });
    await Detalle.destroy({ where: { transaccionId: id } });

    const nuevosDetalles = detalles.map(d => ({
      transaccionId: id,
      cuentaId: d.cuentaId,
      monto: d.monto,
      tipo: d.tipo
    }));

    await Detalle.bulkCreate(nuevosDetalles);

    await registrarAuditoria(req, 'update', 'transaccion', id, `Transacción actualizada (${descripcion})`);

    res.json({ mensaje: 'Transacción actualizada correctamente' });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al actualizar transacción', error: err.message });
  }
};

exports.eliminarTransaccion = async (req, res) => {
  try {
    const { id } = req.params;

    const transaccion = await Transaccion.findByPk(id);
    if (!transaccion) {
      return res.status(404).json({ mensaje: 'Transacción no encontrada' });
    }

    await Detalle.destroy({ where: { transaccionId: id } });
    await transaccion.destroy();

    await registrarAuditoria(req, 'delete', 'transaccion', id, `Transacción eliminada (${transaccion.descripcion})`);

    res.json({ mensaje: 'Transacción eliminada correctamente' });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al eliminar transacción', error: err.message });
  }
};