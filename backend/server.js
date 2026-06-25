const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para entender contenido en formato JSON
app.use(express.json());

// Ruta de prueba (Endpoint de salud del servidor)
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'Servidor respondiendo correctamente',
        timestamp: new Date()
    });
});

// Ruta para la raíz del sitio
app.get('/', (req, res) => {
    res.send('¡Bienvenido al servidor de Comercializadora Dealer!');
});

// Inicializar el servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});