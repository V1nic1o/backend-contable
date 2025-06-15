const express = require('express');
const router = express.Router();
const controller = require('../controllers/producto.controller');

// CRUD productos
router.get('/', controller.obtenerProductos);
router.post('/', controller.crearProducto);
router.put('/:id', controller.actualizarProducto);
router.delete('/:id', controller.eliminarProducto);

module.exports = router;