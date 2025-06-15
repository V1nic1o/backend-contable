const db = require('../models');
const Empleado = db.empleado;

// Crear nuevo empleado
exports.crearEmpleado = async (req, res) => {
  try {
    const nuevo = await Empleado.create(req.body);
    res.status(201).json(nuevo);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al crear empleado', error: err.message });
  }
};

// Obtener todos los empleados
exports.obtenerEmpleados = async (req, res) => {
  try {
    const empleados = await Empleado.findAll();
    res.json(empleados);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al obtener empleados', error: err.message });
  }
};

// Actualizar empleado
exports.actualizarEmpleado = async (req, res) => {
  try {
    const { id } = req.params;
    const empleado = await Empleado.findByPk(id);
    if (!empleado) return res.status(404).json({ mensaje: 'Empleado no encontrado' });

    await empleado.update(req.body);
    res.json({ mensaje: 'Empleado actualizado correctamente', empleado });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al actualizar empleado', error: err.message });
  }
};

// Eliminar empleado
exports.eliminarEmpleado = async (req, res) => {
  try {
    const { id } = req.params;
    const empleado = await Empleado.findByPk(id);
    if (!empleado) return res.status(404).json({ mensaje: 'Empleado no encontrado' });

    await empleado.destroy();
    res.json({ mensaje: 'Empleado eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al eliminar empleado', error: err.message });
  }
};