const { Op } = require('sequelize');
const { ConciliacionBancaria, MovimientoConciliado } = require('../models');
const XLSX = require('xlsx');
const moment = require('moment');

// 📌 Obtener todas las conciliaciones con filtros opcionales
exports.obtenerConciliaciones = async (req, res) => {
  try {
    const { estado, banco, desde, hasta } = req.query;
    const where = {};
    if (estado) where.estado = estado;
    if (banco) where.banco = banco;
    if (desde && hasta) {
      where.fecha = {
        [Op.between]: [new Date(desde), new Date(hasta)]
      };
    }

    const conciliaciones = await ConciliacionBancaria.findAll({
      where,
      include: [{ model: MovimientoConciliado, as: 'movimientos' }],
      order: [['fecha', 'DESC']]
    });

    res.json(conciliaciones);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al obtener conciliaciones', error: err.message });
  }
};

// 📌 Obtener una conciliación por ID
exports.obtenerConciliacionPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const conciliacion = await ConciliacionBancaria.findByPk(id, {
      include: [{ model: MovimientoConciliado, as: 'movimientos' }]
    });

    if (!conciliacion) return res.status(404).json({ mensaje: 'Conciliación no encontrada' });
    res.json(conciliacion);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al obtener conciliación', error: err.message });
  }
};

// 📌 Crear nueva conciliación
exports.crearConciliacion = async (req, res) => {
  try {
    const nueva = await ConciliacionBancaria.create(req.body);
    res.status(201).json(nueva);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al crear conciliación', error: err.message });
  }
};

// 📌 Editar conciliación existente
exports.editarConciliacion = async (req, res) => {
  try {
    const { id } = req.params;
    const conciliacion = await ConciliacionBancaria.findByPk(id);
    if (!conciliacion) return res.status(404).json({ mensaje: 'Conciliación no encontrada' });

    await conciliacion.update(req.body);
    res.json({ mensaje: '✅ Conciliación actualizada', conciliacion });
  } catch (err) {
    res.status(500).json({ mensaje: '❌ Error al editar conciliación', error: err.message });
  }
};

// 📌 Eliminar conciliación
exports.eliminarConciliacion = async (req, res) => {
  try {
    const { id } = req.params;
    const conciliacion = await ConciliacionBancaria.findByPk(id);
    if (!conciliacion) return res.status(404).json({ mensaje: 'Conciliación no encontrada' });

    await conciliacion.destroy();
    res.json({ mensaje: '✅ Conciliación eliminada' });
  } catch (err) {
    res.status(500).json({ mensaje: '❌ Error al eliminar conciliación', error: err.message });
  }
};

// 📌 Agregar movimiento a una conciliación
exports.agregarMovimiento = async (req, res) => {
  try {
    const { conciliacionId } = req.params;
    const data = { ...req.body, conciliacionId };
    const movimiento = await MovimientoConciliado.create(data);
    res.status(201).json(movimiento);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al agregar movimiento', error: err.message });
  }
};

// 📌 Eliminar movimiento de conciliación
exports.eliminarMovimiento = async (req, res) => {
  try {
    const { id } = req.params;
    const mov = await MovimientoConciliado.findByPk(id);
    if (!mov) return res.status(404).json({ mensaje: 'Movimiento no encontrado' });

    await mov.destroy();
    res.json({ mensaje: 'Movimiento eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al eliminar movimiento', error: err.message });
  }
};

// 📌 Marcar conciliación como conciliada o pendiente
exports.actualizarEstadoConciliacion = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    const conciliacion = await ConciliacionBancaria.findByPk(id);
    if (!conciliacion) return res.status(404).json({ mensaje: 'Conciliación no encontrada' });

    if (!['pendiente', 'conciliado'].includes(estado)) {
      return res.status(400).json({ mensaje: 'Estado inválido. Debe ser "pendiente" o "conciliado"' });
    }

    conciliacion.estado = estado;
    await conciliacion.save();
    res.json({ mensaje: 'Estado actualizado correctamente', conciliacion });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al actualizar estado', error: err.message });
  }
};

// ✅ Manejo seguro de fechas desde Excel
const procesarFecha = (valor) => {
  const fechaTexto = typeof valor === 'string' ? valor.trim() : '';
  const fechaFormateada = moment(fechaTexto, ['DD/MM/YYYY', 'YYYY-MM-DD'], true);
  return fechaFormateada.isValid() ? fechaFormateada.toDate() : new Date();
};

// 📌 Importar conciliaciones desde archivo Excel
exports.importarConciliacionesDesdeExcel = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ mensaje: 'No se recibió ningún archivo Excel.' });

    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const datos = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
    const resultados = [];

    for (const fila of datos) {
      const conciliacion = await ConciliacionBancaria.create({
        banco: fila.Banco || '',
        fecha: procesarFecha(fila.Fecha),
        numeroCheque: fila.NumeroCheque || '',
        referenciaBancaria: fila.Referencia || '',
        montoSistema: fila.MontoSistema || 0,
        montoBanco: fila.MontoBanco || 0,
        observaciones: fila.Observaciones || '',
        estado: 'pendiente'
      });
      resultados.push(conciliacion);
    }

    res.status(201).json({
      mensaje: `✅ ${resultados.length} conciliaciones importadas correctamente`,
      conciliaciones: resultados
    });
  } catch (err) {
    res.status(500).json({ mensaje: '❌ Error al importar conciliaciones', error: err.message });
  }
};

// 📌 Conciliar automáticamente desde archivo Excel
exports.conciliarDesdeExcel = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ mensaje: 'No se recibió ningún archivo Excel.' });

    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const datos = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
    const resultados = [];
    const { buscarTransaccionConciliable } = require('./transaccion.controller');

    for (const fila of datos) {
      const { Banco, Fecha, NumeroCheque, Referencia, MontoBanco, Observaciones } = fila;

      const transaccion = await buscarTransaccionConciliable({
        numeroCheque: NumeroCheque,
        referenciaBancaria: Referencia
      });

      const conciliacion = await ConciliacionBancaria.create({
        banco: Banco || '',
        fecha: procesarFecha(Fecha),
        numeroCheque: NumeroCheque || '',
        referenciaBancaria: Referencia || '',
        montoSistema: transaccion?.detalles?.[0]?.monto || 0,
        montoBanco: MontoBanco || 0,
        observaciones: Observaciones || '',
        estado: transaccion ? 'conciliado' : 'pendiente'
      });

      if (transaccion) {
        await MovimientoConciliado.create({
          conciliacionId: conciliacion.id,
          transaccionId: transaccion.id,
          descripcion: transaccion.descripcion,
          monto: transaccion.detalles?.[0]?.monto || 0
        });
      }

      resultados.push({
        id: conciliacion.id,
        estado: conciliacion.estado,
        cheque: NumeroCheque,
        referencia: Referencia,
        transaccionId: transaccion?.id || null
      });
    }

    res.status(201).json({
      mensaje: `✅ ${resultados.length} conciliaciones procesadas`,
      resumen: {
        conciliadas: resultados.filter(r => r.estado === 'conciliado').length,
        pendientes: resultados.filter(r => r.estado === 'pendiente').length
      },
      detalles: resultados
    });
  } catch (err) {
    res.status(500).json({ mensaje: '❌ Error al conciliar desde Excel', error: err.message });
  }
};