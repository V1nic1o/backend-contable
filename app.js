const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

const authRoutes = require('./routes/auth.routes');
const cuentaRoutes = require('./routes/cuenta.routes');
const transaccionRoutes = require('./routes/transaccion.routes');
const reporteRoutes = require('./routes/reporte.routes');
const auditoriaRoutes = require('./routes/auditoria.routes');
const ejercicioRoutes = require('./routes/ejercicio.routes');

// ✅ Primero se configuran los middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Luego se cargan las rutas
app.use('/api/auth', authRoutes);
app.use('/api/cuentas', cuentaRoutes);
app.use('/api/transacciones', transaccionRoutes);
app.use('/api/reportes', reporteRoutes);
app.use('/api/auditorias', auditoriaRoutes);
app.use('/api/ejercicios', ejercicioRoutes);

// Ruta de prueba inicial
app.get('/', (req, res) => {
  res.send('Sistema Contable Backend Activo ✅');
});

module.exports = app;