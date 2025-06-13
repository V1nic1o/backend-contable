const db = require('../models');
const Transaccion = db.transacciones;
const Detalle = db.detallesTransaccion;
const Cuenta = db.cuentas;
const Ejercicio = db.ejercicios;
const { Op } = require('sequelize');
const { registrarAuditoria } = require('../services/auditoriaService');
const { importarDesdeExcel } = require('../services/importacionExcelService'); // ✅ Nuevo

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

    const nuevaTransaccion = await Transaccion.create(
      { fecha, descripcion, ejercicioId, detalles },
      { include: [{ model: Detalle, as: 'detalles' }] }
    );

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

    const transacciones = await Transaccion.findAll({
      where: condiciones,
      include: {
        model: Detalle,
        as: 'detalles',
        include: {
          model: Cuenta,
          attributes: ['codigo', 'nombre', 'tipo'],
          where: cuentaId ? { id: cuentaId } : undefined
        }
      },
      order: [['fecha', 'DESC']]
    });

    res.json(transacciones);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al obtener transacciones', error: err.message });
  }
};

// ✅ NUEVA FUNCIÓN: importar transacciones desde archivo Excel
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