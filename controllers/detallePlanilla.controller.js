const db = require('../models');
const Detalle = db.detallePlanilla;

// Agregar detalle a una planilla
exports.agregarDetalle = async (req, res) => {
  try {
    const nuevo = await Detalle.create(req.body);
    res.status(201).json(nuevo);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al agregar detalle', error: err.message });
  }
};

// Eliminar un detalle de planilla
exports.eliminarDetalle = async (req, res) => {
  try {
    const { id } = req.params;
    const detalle = await Detalle.findByPk(id);
    if (!detalle) return res.status(404).json({ mensaje: 'Detalle no encontrado' });

    await detalle.destroy();
    res.json({ mensaje: 'Detalle eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al eliminar detalle', error: err.message });
  }
};