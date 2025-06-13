const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');

// Registro y login
router.post('/register', authController.register);
router.post('/login', authController.login);

// 👤 Rutas del perfil personal (usuario logueado)
router.get('/perfil', verifyToken, authController.obtenerPerfil);
router.put('/perfil', verifyToken, authController.actualizarPerfil);

// 🛡️ Rutas protegidas solo para administradores
router.get('/usuarios', verifyToken, isAdmin, async (req, res) => {
  try {
    const db = require('../models');
    const usuarios = await db.usuarios.findAll();
    res.json(usuarios);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al obtener usuarios', error: err.message });
  }
});

router.put('/usuarios/:id', verifyToken, isAdmin, authController.editarUsuario);
router.delete('/usuarios/:id', verifyToken, isAdmin, authController.eliminarUsuario);

module.exports = router;