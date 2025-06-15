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

// ✅ Actualizar nombre y año de un ejercicio existente
exports.actualizarEjercicio = async (req, res) => {
  try {
    const { id } = req.params;
    const { anio, descripcion, activo } = req.body;

    const ejercicio = await Ejercicio.findByPk(id);
    if (!ejercicio) return res.status(404).json({ mensaje: 'Ejercicio no encontrado' });

    // Verificar si ya existe otro ejercicio con ese mismo año
    const existeDuplicado = await Ejercicio.findOne({ where: { anio, id: { [db.Sequelize.Op.ne]: id } } });
    if (existeDuplicado) {
      return res.status(400).json({ mensaje: 'Ya existe un ejercicio con ese año' });
    }

    ejercicio.anio = anio;
    ejercicio.descripcion = descripcion;
    if (activo !== undefined) ejercicio.activo = activo;

    await ejercicio.save();
    res.json({ mensaje: 'Ejercicio actualizado correctamente', ejercicio });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al actualizar ejercicio', error: err.message });
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

// Eliminar ejercicio
exports.eliminarEjercicio = async (req, res) => {
  try {
    const { id } = req.params;
    const ejercicio = await Ejercicio.findByPk(id);
    if (!ejercicio) return res.status(404).json({ mensaje: 'Ejercicio no encontrado' });

    await ejercicio.destroy();
    res.json({ mensaje: 'Ejercicio eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al eliminar ejercicio', error: err.message });
  }
};