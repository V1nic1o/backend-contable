const express = require('express');
const router = express.Router();
const cuentaController = require('../controllers/cuenta.controller');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');
const multer = require('multer');

// Configuración para subir archivos .xlsx
const upload = multer({ dest: 'uploads/' });

router.post('/', verifyToken, isAdmin, cuentaController.crearCuenta);
router.get('/', verifyToken, cuentaController.obtenerCuentas);
router.put('/:id', verifyToken, isAdmin, cuentaController.actualizarCuenta);
router.delete('/:id', verifyToken, isAdmin, cuentaController.eliminarCuenta);

// ✅ NUEVA RUTA: importar cuentas desde archivo Excel
router.post('/importar', verifyToken, isAdmin, upload.single('archivo'), cuentaController.importarCuentas);

module.exports = router;