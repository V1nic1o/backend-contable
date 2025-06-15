const express = require('express');
const router = express.Router();
const empleadoCtrl = require('../controllers/empleado.controller');

router.post('/', empleadoCtrl.crearEmpleado);
router.get('/', empleadoCtrl.obtenerEmpleados);
router.put('/:id', empleadoCtrl.actualizarEmpleado);
router.delete('/:id', empleadoCtrl.eliminarEmpleado);

module.exports = router;