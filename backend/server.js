const express = require('express');
const cors = require('cors');
const db = require('./config/database');

const authRoutes = require('./routes/authRoutes');
const configRoutes = require('./routes/configRoutes');
const afiliadosRoutes = require('./routes/afiliadosRoutes');
const transaccionesRoutes = require('./routes/transaccionesRoutes');
const periodosRoutes = require('./routes/periodosRoutes');

const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares
app.use(cors());
app.use(express.json());

// Montar Rutas API (Preservando 100% las URLs originales para el Frontend)
app.use('/api/auth', authRoutes);
app.use('/api/configuracion', configRoutes);
app.use('/api/afiliados', afiliadosRoutes);
app.use('/api/transacciones', transaccionesRoutes);
app.use('/api', periodosRoutes);

// Endpoint de Salud del servidor
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Cierre limpio de la base de datos
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) console.error(err.message);
        console.log('🔒 Conexión a la base de datos SQLite cerrada.');
        process.exit(0);
    });
});

// Encender Servidor
app.listen(PORT, () => {
    console.log(`🚀 API Servidor corriendo en http://localhost:${PORT}`);
});