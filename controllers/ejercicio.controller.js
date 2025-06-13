const db = require('../models');
const Ejercicio = db.ejercicios;

// Crear nuevo ejercicio
exports.crearEjercicio = async (req, res) => {
  try {
    const { anio, descripcion } = req.body;

    const yaExiste = await Ejercicio.findOne({ where: { anio } });
    if (yaExiste) return res.status(400).json({ mensaje: 'Este año ya fue registrado' });

    const ejercicio = await Ejercicio.create({ anio, descripcion });
    res.status(201).json({ mensaje: 'Ejercicio creado', ejercicio });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al crear ejercicio', error: err.message });
  }
};

// Listar todos los ejercicios
exports.obtenerEjercicios = async (req, res) => {
  try {
    const ejercicios = await Ejercicio.findAll({ order: [['anio', 'DESC']] });
    res.json(ejercicios);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al obtener ejercicios', error: err.message });
  }
};

// Activar/Inactivar ejercicio
exports.actualizarEstado = async (req, res) => {
  try {
    const { id } = req.params;
    const ejercicio = await Ejercicio.findByPk(id);
    if (!ejercicio) return res.status(404).json({ mensaje: 'Ejercicio no encontrado' });

    ejercicio.activo = !ejercicio.activo;
    await ejercicio.save();

    res.json({ mensaje: 'Estado actualizado', ejercicio });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al actualizar estado', error: err.message });
  }
};