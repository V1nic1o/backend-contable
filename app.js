const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// ✅ Importación de rutas
const authRoutes = require('./routes/auth.routes');
const cuentaRoutes = require('./routes/cuenta.routes');
const transaccionRoutes = require('./routes/transaccion.routes');
const reporteRoutes = require('./routes/reporte.routes');
const auditoriaRoutes = require('./routes/auditoria.routes');
const ejercicioRoutes = require('./routes/ejercicio.routes');
const conciliacionRoutes = require('./routes/conciliacion.routes');
const productoRoutes = require('./routes/producto.routes');
const movimientoInventarioRoutes = require('./routes/movimientoInventario.routes');
const dashboardRoutes = require('./routes/dashboard.routes');


// ✅ NUEVAS rutas de módulo Planillas e IGSS
const empleadoRoutes = require('./routes/empleado.routes');
const planillaRoutes = require('./routes/planilla.routes');
const detallePlanillaRoutes = require('./routes/detallePlanilla.routes');

// ✅ Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Rutas principales
app.use('/api/auth', authRoutes);
app.use('/api/cuentas', cuentaRoutes);
app.use('/api/transacciones', transaccionRoutes);
app.use('/api/reportes', reporteRoutes);
app.use('/api/auditoria', auditoriaRoutes);
app.use('/api/ejercicios', ejercicioRoutes);
app.use('/api/conciliaciones', conciliacionRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/movimientos-inventario', movimientoInventarioRoutes);
app.use('/api/dashboard', dashboardRoutes);

// ✅ Rutas Planilla e IGSS
app.use('/api/empleados', empleadoRoutes);
app.use('/api/planillas', planillaRoutes);
app.use('/api/detalles-planilla', detallePlanillaRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('Sistema Contable Backend Activo ✅');
});

module.exports = app;