const db = require('../models');
const Usuario = db.usuarios;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { registrarAuditoria } = require('../services/auditoriaService'); // ✅ Agregado

exports.register = async (req, res) => {
  try {
    const { nombre, correo, contrasena } = req.body;

    const existe = await Usuario.findOne({ where: { correo } });
    if (existe) return res.status(400).json({ mensaje: 'Correo ya registrado' });

    const nuevoUsuario = await Usuario.create({
      nombre,
      correo,
      contrasena,
      rol: 'lector' // ✅ asignación fija y segura
    });

    await registrarAuditoria(req, 'create', 'usuario', nuevoUsuario.id, `Usuario creado (${correo})`);

    res.status(201).json({ mensaje: 'Usuario registrado exitosamente', usuario: nuevoUsuario });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al registrar usuario', error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { correo, contrasena } = req.body;
    const usuario = await Usuario.findOne({ where: { correo } });

    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

    const valido = await bcrypt.compare(contrasena, usuario.contrasena);
    if (!valido) return res.status(401).json({ mensaje: 'Contraseña incorrecta' });

    const token = jwt.sign({ id: usuario.id, rol: usuario.rol }, process.env.JWT_SECRET, { expiresIn: '8h' });

    // ✅ Ahora también devolvemos nombre, rol e id
    res.json({
      mensaje: 'Login exitoso',
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol
      }
    });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al iniciar sesión', error: err.message });
  }
};

exports.editarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, correo, contrasena, rol } = req.body;

    const usuario = await Usuario.findByPk(id);
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

    await usuario.update({ nombre, correo, contrasena, rol });

    // ✅ Auditoría
    await registrarAuditoria(req, 'update', 'usuario', usuario.id, `Usuario actualizado (${correo})`);

    res.json({ mensaje: 'Usuario actualizado correctamente', usuario });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al editar usuario', error: err.message });
  }
};

exports.eliminarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = await Usuario.findByPk(id);
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

    await usuario.destroy();

    // ✅ Auditoría
    await registrarAuditoria(req, 'delete', 'usuario', usuario.id, `Usuario eliminado (${usuario.correo})`);

    res.json({ mensaje: 'Usuario eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al eliminar usuario', error: err.message });
  }
};

// ✅ Obtener perfil del usuario actual
exports.obtenerPerfil = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.usuario.id, {
      attributes: { exclude: ['contrasena'] }
    });
    res.json(usuario);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al obtener perfil', error: err.message });
  }
};

// ✅ Actualizar perfil del usuario actual
exports.actualizarPerfil = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.usuario.id);
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

    const { nombre, correo, contrasena } = req.body;

    if (nombre) usuario.nombre = nombre;
    if (correo) usuario.correo = correo;
    if (contrasena) {
      const salt = await bcrypt.genSalt(10);
      usuario.contrasena = await bcrypt.hash(contrasena, salt);
    }

    await usuario.save();
    res.json({ mensaje: 'Perfil actualizado', usuario });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al actualizar perfil', error: err.message });
  }
};