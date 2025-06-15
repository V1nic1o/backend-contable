const express = require('express');
const router = express.Router();
const planillaCtrl = require('../controllers/planilla.controller');

router.post('/', planillaCtrl.crearPlanilla);
router.get('/', planillaCtrl.obtenerPlanillas);
router.delete('/:id', planillaCtrl.eliminarPlanilla);

module.exports = router;