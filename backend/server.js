const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
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

// --- LÓGICA DE AUTO-CIERRE (HEARTBEAT) ---
let ultimoHeartbeat = Date.now();

// Endpoint al que llama el Frontend en App.jsx cada 2 segundos
app.get('/api/ping', (req, res) => {
    ultimoHeartbeat = Date.now();
    res.sendStatus(200);
});

// Comprobación de inactividad cada 3 segundos
setInterval(() => {
    const tiempoInactivo = Date.now() - ultimoHeartbeat;

    if (tiempoInactivo > 5000) {
        console.log('🔴 Navegador cerrado. Finalizando base de datos y cerrando consolas...');

        db.close((err) => {
            if (err) console.error('Error al cerrar la BD:', err.message);
            else console.log('🔒 Conexión a la base de datos SQLite cerrada.');

            // Mata forzosamente todos los procesos de Node (destruye node.exe, vite y node --watch)
            exec('taskkill /F /IM node.exe /T', () => {
                // Mata las consolas CMD secundarias
                exec('taskkill /F /IM cmd.exe /T');
            });
        });
    }
}, 3000);
// ------------------------------------------

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

// Cierre limpio de la base de datos ante interrupción manual (Ctrl+C)
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