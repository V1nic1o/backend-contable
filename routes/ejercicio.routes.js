// ejercicio.routes.js
const express = require('express');
const router = express.Router();
const ejercicioController = require('../controllers/ejercicio.controller');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');

// Crear nuevo ejercicio
router.post('/', verifyToken, isAdmin, ejercicioController.crearEjercicio);

// Obtener todos los ejercicios
router.get('/', verifyToken, ejercicioController.obtenerEjercicios);

// Actualizar datos completos de un ejercicio (nombre, año, activo)
router.put('/:id', verifyToken, isAdmin, ejercicioController.actualizarEjercicio); // ✅ Esta es la que faltaba

// Cambiar el estado activo de un ejercicio
router.put('/:id/estado', verifyToken, isAdmin, ejercicioController.actualizarEstado);

// Eliminar un ejercicio
router.delete('/:id', verifyToken, isAdmin, ejercicioController.eliminarEjercicio);

module.exports = router;