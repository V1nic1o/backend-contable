// routes/dashboard.routes.js
const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');

router.get('/resumen', dashboardController.obtenerResumenContable);
router.get('/historial', dashboardController.obtenerDetallePorTipo);

module.exports = router;