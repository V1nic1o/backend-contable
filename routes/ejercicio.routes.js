const express = require('express');
const router = express.Router();
const ejercicioController = require('../controllers/ejercicio.controller');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');

// Rutas protegidas para admins
router.post('/', verifyToken, isAdmin, ejercicioController.crearEjercicio);
router.get('/', verifyToken, ejercicioController.obtenerEjercicios);
router.put('/:id/estado', verifyToken, isAdmin, ejercicioController.actualizarEstado);

module.exports = router;