const express = require('express');
const router = express.Router();
const auditoriaController = require('../controllers/auditoria.controller');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');

// Solo administradores pueden consultar el historial de auditoría
router.get('/', verifyToken, isAdmin, auditoriaController.obtenerAuditorias);

// ✅ Exportar auditoría en Excel o PDF
router.get('/exportar', verifyToken, isAdmin, auditoriaController.exportarAuditoria);

module.exports = router;