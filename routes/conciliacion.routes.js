const express = require('express');
const router = express.Router();
const conciliacionController = require('../controllers/conciliacion.controller');

// Middleware para subir archivos Excel
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Obtener todas las conciliaciones
router.get('/', conciliacionController.obtenerConciliaciones);

// Obtener una conciliación por ID
router.get('/:id', conciliacionController.obtenerConciliacionPorId);

// Crear una nueva conciliación
router.post('/', conciliacionController.crearConciliacion);

// Editar una conciliación existente
router.put('/:id', conciliacionController.editarConciliacion);

// Eliminar una conciliación
router.delete('/:id', conciliacionController.eliminarConciliacion);

// Agregar un movimiento a una conciliación
router.post('/:conciliacionId/movimientos', conciliacionController.agregarMovimiento);

// Eliminar un movimiento
router.delete('/movimientos/:id', conciliacionController.eliminarMovimiento);

// Cambiar estado de una conciliación (conciliado / pendiente)
router.put('/:id/estado', conciliacionController.actualizarEstadoConciliacion);

// ✅ Conciliar automáticamente desde archivo Excel (nombre de campo debe ser 'archivo')
router.post(
  '/conciliar-excel',
  upload.single('archivo'),
  conciliacionController.conciliarDesdeExcel
);

// ✅ Importar conciliaciones desde archivo Excel
router.post(
  '/importar',
  upload.single('archivo'),
  conciliacionController.importarConciliacionesDesdeExcel
);

module.exports = router;