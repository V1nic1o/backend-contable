const db = require('../models');
const Cuenta = db.cuentas;
const { Op } = require('sequelize');
const { registrarAuditoria } = require('../services/auditoriaService');
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

exports.crearCuenta = async (req, res) => {
  try {
    const { codigo, nombre, tipo, descripcion } = req.body;
    const cuenta = await Cuenta.create({ codigo, nombre, tipo, descripcion });

    await registrarAuditoria(req, 'create', 'cuenta', cuenta.id, `Cuenta creada (${codigo})`);
    res.status(201).json({ mensaje: 'Cuenta creada', cuenta });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al crear cuenta', error: err.message });
  }
};

exports.obtenerCuentas = async (req, res) => {
  try {
    const { tipo, buscar } = req.query;
    const condiciones = {};

    if (tipo) condiciones.tipo = tipo;

    if (buscar) {
      condiciones[Op.or] = [
        { nombre: { [Op.iLike]: `%${buscar}%` } },
        { codigo: { [Op.iLike]: `%${buscar}%` } }
      ];
    }

    const cuentas = await Cuenta.findAll({ where: condiciones });
    res.json(cuentas);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al obtener cuentas', error: err.message });
  }
};

exports.actualizarCuenta = async (req, res) => {
  try {
    const { id } = req.params;
    const cuenta = await Cuenta.findByPk(id);
    if (!cuenta) return res.status(404).json({ mensaje: 'Cuenta no encontrada' });

    await cuenta.update(req.body);
    await registrarAuditoria(req, 'update', 'cuenta', cuenta.id, `Cuenta actualizada (${cuenta.codigo})`);

    res.json({ mensaje: 'Cuenta actualizada', cuenta });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al actualizar cuenta', error: err.message });
  }
};

exports.eliminarCuenta = async (req, res) => {
  try {
    const { id } = req.params;
    const cuenta = await Cuenta.findByPk(id);
    if (!cuenta) return res.status(404).json({ mensaje: 'Cuenta no encontrada' });

    await cuenta.destroy();
    await registrarAuditoria(req, 'delete', 'cuenta', cuenta.id, `Cuenta eliminada (${cuenta.codigo})`);

    res.json({ mensaje: 'Cuenta eliminada' });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al eliminar cuenta', error: err.message });
  }
};

exports.importarCuentas = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ mensaje: 'No se envió ningún archivo.' });
    }

    const filePath = path.join(__dirname, '..', req.file.path);
    const workbook = xlsx.readFile(filePath);
    const hoja = workbook.Sheets[workbook.SheetNames[0]];
    const datos = xlsx.utils.sheet_to_json(hoja);

    let cuentasImportadas = [];

    for (const fila of datos) {
      const codigo = fila.codigo?.toString().trim();
      const nombre = fila.nombre?.toString().trim();
      const tipo = fila.tipo?.toLowerCase().trim();
      const descripcion = fila.descripcion?.toString().trim() || '';
      const activo = typeof fila.activo === 'boolean' ? fila.activo : true;

      if (!codigo || !nombre || !tipo) {
        console.warn(`⚠️ Fila incompleta ignorada:`, fila);
        continue;
      }

      if (!['activo', 'pasivo', 'ingreso', 'egreso'].includes(tipo)) {
        console.warn(`❌ Tipo inválido en la fila:`, tipo);
        continue;
      }

      const yaExiste = await Cuenta.findOne({ where: { codigo } });
      if (yaExiste) {
        console.log(`ℹ️ Cuenta con código ${codigo} ya existe. Ignorada.`);
        continue;
      }

      const cuenta = await Cuenta.create({ codigo, nombre, tipo, descripcion, activo });
      await registrarAuditoria(req, 'create', 'cuenta', cuenta.id, `Cuenta importada desde Excel (${codigo})`);
      cuentasImportadas.push(cuenta);
    }

    fs.unlinkSync(filePath);

    res.status(201).json({
      mensaje: `✅ Se importaron ${cuentasImportadas.length} cuentas.`,
      cuentas: cuentasImportadas
    });

  } catch (err) {
    console.error('❌ Error al importar cuentas:', err);
    res.status(500).json({ mensaje: 'Error al importar cuentas', error: err.message });
  }
};