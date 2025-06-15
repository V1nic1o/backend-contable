const db = require('../models');
const Planilla = db.planilla;
const Detalle = db.detallePlanilla;
const Empleado = db.empleado;

// Crear nueva planilla
exports.crearPlanilla = async (req, res) => {
  try {
    const nueva = await Planilla.create(req.body);
    res.status(201).json(nueva);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al crear planilla', error: err.message });
  }
};

// Obtener todas las planillas
exports.obtenerPlanillas = async (req, res) => {
  try {
    const planillas = await Planilla.findAll({
      include: { model: Detalle, as: 'detalles', include: { model: Empleado, as: 'empleado' } },
      order: [['fecha', 'DESC']]
    });
    res.json(planillas);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al obtener planillas', error: err.message });
  }
};

// Eliminar una planilla
exports.eliminarPlanilla = async (req, res) => {
  try {
    const { id } = req.params;
    const planilla = await Planilla.findByPk(id);
    if (!planilla) return res.status(404).json({ mensaje: 'Planilla no encontrada' });

    await planilla.destroy();
    res.json({ mensaje: 'Planilla eliminada correctamente' });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al eliminar planilla', error: err.message });
  }
};

// Generar planilla completa automáticamente
exports.generarPlanillaMensual = async (req, res) => {
  try {
    const { mes, descripcion } = req.body;
    if (!mes) return res.status(400).json({ mensaje: 'El campo "mes" es obligatorio' });

    // Validar si ya existe
    const existente = await Planilla.findOne({ where: { mes } });
    if (existente) return res.status(400).json({ mensaje: 'Ya existe una planilla para este mes' });

    // Crear encabezado de planilla
    const nueva = await Planilla.create({ mes, descripcion });

    // Buscar empleados activos
    const empleados = await Empleado.findAll({ where: { estado: 'activo' } });

    const detalles = [];

    for (const emp of empleados) {
      const igssLaboral = parseFloat((emp.salarioBase * 0.0483).toFixed(2));
      const igssPatronal = parseFloat((emp.salarioBase * 0.1267).toFixed(2));
      const totalAPagar = parseFloat((emp.salarioBase + emp.bonificacion - igssLaboral).toFixed(2));

      const detalle = await Detalle.create({
        planillaId: nueva.id,
        empleadoId: emp.id,
        salario: emp.salarioBase,
        bonificacion: emp.bonificacion,
        igssLaboral,
        igssPatronal,
        totalAPagar
      });

      detalles.push(detalle);
    }

    res.status(201).json({
      mensaje: `✅ Planilla generada con ${detalles.length} empleados`,
      planilla: nueva,
      detalles
    });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al generar planilla', error: err.message });
  }
};