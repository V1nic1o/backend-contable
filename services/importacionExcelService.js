const XLSX = require('xlsx');
const db = require('../models');
const Transaccion = db.transacciones;
const Detalle = db.detallesTransaccion;
const Cuenta = db.cuentas;
const { registrarAuditoria } = require('./auditoriaService');

async function importarDesdeExcel(buffer, req) {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const hoja = workbook.Sheets[workbook.SheetNames[0]];
  const datos = XLSX.utils.sheet_to_json(hoja);

  if (!datos.length) throw new Error('El archivo está vacío.');

  // Agrupar filas por operación
  const operaciones = {};
  for (const fila of datos) {
    const op = fila.operacion?.toString();
    if (!op || !fila.cuentaCodigo || !fila.tipo || !fila.monto || !fila.fecha) {
      throw new Error('Archivo inválido. Verifica columnas requeridas.');
    }

    if (!operaciones[op]) {
      operaciones[op] = {
        fecha: fila.fecha,
        descripcion: fila.descripcion || 'Sin descripción',
        detalles: []
      };
    }

    // Validar tipo
    const tipo = fila.tipo.toLowerCase();
    if (tipo !== 'debe' && tipo !== 'haber') {
      throw new Error(`Tipo inválido en operación ${op}: ${fila.tipo}`);
    }

    // Buscar cuenta por código
    const cuenta = await Cuenta.findOne({ where: { codigo: fila.cuentaCodigo } });
    if (!cuenta) throw new Error(`Cuenta con código ${fila.cuentaCodigo} no existe.`);

    operaciones[op].detalles.push({
      cuentaId: cuenta.id,
      tipo,
      monto: parseFloat(fila.monto)
    });
  }

  // Crear transacciones agrupadas
  const resultados = [];
  for (const op in operaciones) {
    const grupo = operaciones[op];
    const tieneDebe = grupo.detalles.some(d => d.tipo === 'debe');
    const tieneHaber = grupo.detalles.some(d => d.tipo === 'haber');
    if (!tieneDebe || !tieneHaber) {
      throw new Error(`Operación ${op} no tiene debe y haber.`);
    }

    const transaccion = await Transaccion.create(
      {
        fecha: grupo.fecha,
        descripcion: grupo.descripcion,
        detalles: grupo.detalles
      },
      { include: [{ model: Detalle, as: 'detalles' }] }
    );

    await registrarAuditoria(req, 'import', 'transaccion', transaccion.id, `Importada desde archivo Excel (operación ${op})`);
    resultados.push(transaccion);
  }

  return resultados;
}

module.exports = {
  importarDesdeExcel
};