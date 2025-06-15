const express = require('express');
const router = express.Router();
const transaccionController = require('../controllers/transaccion.controller');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');
const multer = require('multer');

// 🧠 Almacenamiento en memoria para archivos Excel
const upload = multer({ storage: multer.memoryStorage() });

// ✅ Registrar una nueva transacción (solo para administradores)
router.post('/', verifyToken, isAdmin, transaccionController.crearTransaccion);

// ✅ Obtener todas las transacciones (usuarios autenticados)
router.get('/', verifyToken, transaccionController.obtenerTransacciones);

// ✅ Nueva ruta de autocompletado
router.get('/buscar', transaccionController.buscarPorChequeOReferencia);

router.put('/:id', verifyToken, isAdmin, transaccionController.actualizarTransaccion);

router.delete('/:id', verifyToken, isAdmin, transaccionController.eliminarTransaccion);

// ✅ NUEVA RUTA: Importar transacciones desde archivo Excel (.xlsx)
router.post(
  '/importar',
  verifyToken,
  isAdmin,
  upload.single('archivo'),
  transaccionController.importarDesdeExcelController
);

module.exports = router;