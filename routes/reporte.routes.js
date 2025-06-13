const express = require('express');
const router = express.Router();
const reporteController = require('../controllers/reporte.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

// Ruta del balance general (requiere autenticación)
router.get('/balance-general', verifyToken, reporteController.balanceGeneral);

router.get('/estado-resultados', verifyToken, reporteController.estadoResultados);

router.get('/libro-diario', verifyToken, reporteController.libroDiario);

router.get('/pdf/balance-general', verifyToken, reporteController.pdfBalanceGeneral);
router.get('/pdf/estado-resultados', verifyToken, reporteController.pdfEstadoResultados);
router.get('/pdf/libro-diario', verifyToken, reporteController.pdfLibroDiario);

module.exports = router;