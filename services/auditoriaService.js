const db = require('../models');
const Auditoria = db.auditorias;

exports.registrarAuditoria = async (req, accion, entidad, entidadId, descripcion) => {
  try {
    if (!req.usuario || !req.usuario.id) return; // Solo usuarios autenticados

    await Auditoria.create({
      accion,          // 'create', 'update', 'delete'
      entidad,         // ejemplo: 'cuenta', 'usuario', 'transaccion'
      entidadId,       // ID del registro afectado
      descripcion,     // texto breve: 'Cuenta creada con código 1001'
      usuarioId: req.usuario.id
    });
  } catch (err) {
    console.error('⚠️ Error al registrar auditoría:', err.message);
  }
};