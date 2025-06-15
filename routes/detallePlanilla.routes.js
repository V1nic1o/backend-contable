const express = require('express');
const router = express.Router();
const detalleCtrl = require('../controllers/detallePlanilla.controller');

router.post('/', detalleCtrl.agregarDetalle);
router.delete('/:id', detalleCtrl.eliminarDetalle);

module.exports = router;