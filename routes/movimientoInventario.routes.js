const express = require('express');
const router = express.Router();
const controller = require('../controllers/movimientoInventario.controller');

// Movimientos de inventario
router.post('/', controller.registrarMovimiento);
router.get('/producto/:productoId', controller.movimientosPorProducto);

module.exports = router;