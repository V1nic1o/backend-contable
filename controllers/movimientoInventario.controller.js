const db = require('../models');
const Movimiento = db.movimientoInventario;
const Producto = db.producto;

// 📌 Registrar movimiento de inventario
exports.registrarMovimiento = async (req, res) => {
  try {
    const { productoId, tipo, cantidad, observacion, transaccionId } = req.body;

    if (!productoId || !tipo || !cantidad) {
      return res.status(400).json({ mensaje: 'Faltan campos obligatorios' });
    }

    const tiposValidos = ['entrada', 'salida', 'ajuste'];
    if (!tiposValidos.includes(tipo)) {
      return res.status(400).json({ mensaje: 'Tipo de movimiento inválido' });
    }

    const producto = await Producto.findByPk(productoId);
    if (!producto) {
      return res.status(404).json({ mensaje: 'Producto no encontrado' });
    }

    // ⚠️ Usar la propiedad correcta: stockActual
    let nuevoStock = producto.stockActual;
    if (tipo === 'entrada') nuevoStock += cantidad;
    if (tipo === 'salida') nuevoStock -= cantidad;
    if (tipo === 'ajuste') nuevoStock = cantidad;

    await producto.update({ stockActual: nuevoStock });

    const nuevoMovimiento = await Movimiento.create({
      productoId,
      tipo,
      cantidad,
      observacion,
      transaccionId: transaccionId || null
    });

    res.status(201).json({ mensaje: 'Movimiento registrado', movimiento: nuevoMovimiento });
  } catch (err) {
    console.error('❌ Error interno:', err);
    res.status(500).json({ mensaje: 'Error al registrar movimiento', error: err.message });
  }
};

// 📌 Obtener movimientos por producto
exports.movimientosPorProducto = async (req, res) => {
  try {
    const { productoId } = req.params;

    const movimientos = await db.movimientoInventario.findAll({
      where: { productoId },
      order: [['fecha', 'DESC']],
      include: [
        {
          model: db.producto,
          as: 'producto',
          attributes: ['id', 'nombre']
        },
        {
          model: db.transacciones,
          as: 'transaccion',
          attributes: ['id', 'descripcion', 'fecha']
        }
      ]
    });

    res.json(movimientos);
  } catch (err) {
    console.error('❌ Error al obtener movimientos:', err);
    res.status(500).json({ mensaje: 'Error al obtener movimientos', error: err.message });
  }
};