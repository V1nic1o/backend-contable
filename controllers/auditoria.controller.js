const db = require('../models');
const Auditoria = db.auditorias;
const Usuario = db.usuarios;
const { Op } = require('sequelize');
const XLSX = require('xlsx');
const { generarPDF } = require('../services/pdfGenerator');

exports.obtenerAuditorias = async (req, res) => {
  try {
    const { usuarioId, entidad, accion, desde, hasta } = req.query;
    const condiciones = {};

    if (usuarioId) condiciones.usuarioId = usuarioId;
    if (entidad) condiciones.entidad = entidad;
    if (accion) condiciones.accion = accion;
    if (desde || hasta) {
      condiciones.createdAt = {};
      if (desde) condiciones.createdAt[Op.gte] = new Date(desde);
      if (hasta) condiciones.createdAt[Op.lte] = new Date(hasta);
    }

    const auditorias = await Auditoria.findAll({
      where: condiciones,
      include: {
        model: Usuario,
        as: 'usuario',
        attributes: ['id', 'nombre', 'correo']
      },
      order: [['createdAt', 'DESC']]
    });

    res.json(auditorias);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al obtener auditoría', error: err.message });
  }
};

// ✅ NUEVO: exportar auditorías como Excel o PDF
exports.exportarAuditoria = async (req, res) => {
  try {
    const { formato = 'excel', usuarioId, entidad, accion, desde, hasta } = req.query;
    const condiciones = {};

    if (usuarioId) condiciones.usuarioId = usuarioId;
    if (entidad) condiciones.entidad = entidad;
    if (accion) condiciones.accion = accion;
    if (desde || hasta) {
      condiciones.createdAt = {};
      if (desde) condiciones.createdAt[Op.gte] = new Date(desde);
      if (hasta) condiciones.createdAt[Op.lte] = new Date(hasta);
    }

    const auditorias = await Auditoria.findAll({
      where: condiciones,
      include: {
        model: Usuario,
        as: 'usuario',
        attributes: ['nombre', 'correo']
      },
      order: [['createdAt', 'DESC']]
    });

    const datos = auditorias.map((a) => ({
      Usuario: a.usuario?.nombre || 'Desconocido',
      Correo: a.usuario?.correo || '',
      Entidad: a.entidad,
      Acción: a.accion,
      Descripción: a.descripcion,
      Fecha: a.createdAt.toLocaleString()
    }));

    if (formato === 'pdf') {
      return generarPDF('Auditoría del Sistema', (doc) => {
        datos.forEach((item, i) => {
          doc.fontSize(10).text(`${i + 1}. ${item.Usuario} (${item.Correo}) → ${item.Acción} [${item.Entidad}]`);
          doc.text(`    ${item.Descripción}`);
          doc.text(`    Fecha: ${item.Fecha}`);
          doc.moveDown();
        });
      }, res);
    }

    // Por defecto: exportar Excel
    const hoja = XLSX.utils.json_to_sheet(datos);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, 'Auditoria');
    const buffer = XLSX.write(libro, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Disposition', 'attachment; filename=auditoria.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al exportar auditoría', error: err.message });
  }
};