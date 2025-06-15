const express = require('express');
const router = express.Router();
const reporteController = require('../controllers/reporte.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

// 📊 Reportes en JSON (para vista previa o dashboard)
router.get('/balance-general', verifyToken, reporteController.balanceGeneral);
router.get('/estado-resultados', verifyToken, reporteController.estadoResultados);
router.get('/libro-diario', verifyToken, reporteController.libroDiario);

// 📄 Exportar a PDF
router.get('/pdf/balance-general', verifyToken, reporteController.pdfBalanceGeneral);
router.get('/pdf/estado-resultados', verifyToken, reporteController.pdfEstadoResultados);
router.get('/pdf/libro-diario', verifyToken, reporteController.pdfLibroDiario);
router.get('/pdf/auditoria', verifyToken, reporteController.pdfAuditoria); // ✅ NUEVO

// 📊 Exportar a Excel
router.get('/excel/auditoria', verifyToken, reporteController.excelAuditoria); // ✅ NUEVO

module.exports = router;