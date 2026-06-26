const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const PORT = process.env.PORT || 4000; // Usaremos el 4000 para dejar el 5173 o 3000 libre al frontend

// CONFIGURACIÓN MLM (Reglas del negocio modificables)
const CONFIG_MLM = {
    UMBRALES: { 1: 50000, 2: 400000, 3: 2000000, 4: 6000000 },
    PORCENTAJES_PROPIOS: { 1: 1/6, 2: 2/6, 3: 3/6, 4: 4/6 },
    SPREAD_RED: { 1: 1/2, 2: 2/6, 3: 1/6 },
    FACTOR_LIDERAZGO: 1/6
};

// Middlewares
app.use(cors()); // Crucial para que React no sea bloqueado por seguridad local
app.use(express.json());

// ==========================================
// CONEXIÓN Y CREACIÓN DE LA BASE DE DATOS
// ==========================================
const db = new sqlite3.Database('./comercializadora.db', (err) => {
    if (err) console.error('Error al abrir la base de datos:', err.message);
    else console.log('📦 Conectado con éxito a SQLite (comercializadora.db)');
});

// Crear la tabla si no existe
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS afiliados (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            id_patrocinador INTEGER,
            ruta_de_red TEXT,
            utilidad_propia REAL DEFAULT 0
        )
    `);
});

// ==========================================
// FUNCIÓN DE LOGICA MLM (Cerebro)
// ==========================================
function obtenerNivel(utilidadTotal) {
    if (utilidadTotal >= CONFIG_MLM.UMBRALES[4]) return 4;
    if (utilidadTotal >= CONFIG_MLM.UMBRALES[3]) return 3;
    if (utilidadTotal >= CONFIG_MLM.UMBRALES[2]) return 2;
    if (utilidadTotal >= CONFIG_MLM.UMBRALES[1]) return 1;
    return 0;
}

function procesarCalculosMLM(afiliados) {
    // 1. Calcular utilidades de calificación acumuladas
    afiliados.forEach(usuario => {
        const rutaBuscada = `${usuario.ruta_de_red}`;
        const utilidadDescendentes = afiliados
            .filter(sub => sub.id !== usuario.id && sub.ruta_de_red.startsWith(rutaBuscada))
            .reduce((suma, sub) => suma + sub.utilidad_propia, 0);

        usuario.utilidad_total_calificacion = usuario.utilidad_propia + utilidadDescendentes;
        usuario.nivel = obtenerNivel(usuario.utilidad_total_calificacion);
    });

    // 2. Calcular comisiones y bonos
    afiliados.forEach(usuario => {
        usuario.comision_propia = usuario.utilidad_propia * (CONFIG_MLM.PORCENTAJES_PROPIOS[usuario.nivel] || 0);
        usuario.comision_por_red = 0;
        usuario.bono_liderazgo = 0;

        const descendientes = afiliados.filter(sub => sub.id !== usuario.id && sub.ruta_de_red.startsWith(usuario.ruta_de_red));

        descendientes.forEach(desc => {
            if (desc.nivel === 1) usuario.comision_por_red += desc.utilidad_propia * CONFIG_MLM.SPREAD_RED[1];
            if (desc.nivel === 2) usuario.comision_por_red += desc.utilidad_propia * CONFIG_MLM.SPREAD_RED[2];
            if (desc.nivel === 3) usuario.comision_por_red += desc.utilidad_propia * CONFIG_MLM.SPREAD_RED[3];
        });

        if (usuario.nivel === 4) {
            const niveles4Directos = afiliados.filter(sub => sub.id_patrocinador === usuario.id && sub.nivel === 4);
            const cantidadNiveles4Directos = niveles4Directos.length;

            if (cantidadNiveles4Directos >= 1) {
                const utilidadNiveles_1_2_3 = descendientes
                    .filter(desc => desc.nivel >= 1 && desc.nivel <= 3)
                    .reduce((suma, desc) => suma + desc.utilidad_propia, 0);
                
                usuario.bono_liderazgo += utilidadNiveles_1_2_3 * CONFIG_MLM.FACTOR_LIDERAZGO;

                const limiteDirectos = Math.min(cantidadNiveles4Directos, 15);
                for (let i = 3; i <= limiteDirectos; i += 2) {
                    if (niveles4Directos[i - 1]) {
                        usuario.bono_liderazgo += niveles4Directos[i - 1].utilidad_propia * CONFIG_MLM.FACTOR_LIDERAZGO;
                    }
                }
            }
        }

        usuario.comision_total = usuario.comision_propia + usuario.comision_por_red + usuario.bono_liderazgo;
    });

    return afiliados;
}

// ==========================================
// ENDPOINTS / RUTAS DE LA API
// ==========================================

// 1. Obtener todos los afiliados con cálculos del mes en tiempo real
app.get('/api/afiliados', (req, res) => {
    const query = `SELECT * FROM afiliados`;
    db.all(query, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        
        // Pasamos las filas de la base de datos por el motor matemático
        const calculados = procesarCalculosMLM(rows);
        res.json(calculados);
    });
});

// 2. Registrar un nuevo afiliado (Desde el Formulario Frontend)
app.post('/api/afiliados', (req, res) => {
    const { nombre, id_patrocinador, utilidad_propia } = req.body;

    // Si no tiene patrocinador, es un líder raíz
    if (!id_patrocinador) {
        const queryRaiz = `INSERT INTO afiliados (nombre, id_patrocinador, ruta_de_red, utilidad_propia) VALUES (?, null, ?, ?)`;
        db.run(queryRaiz, [nombre, 'temp', utilidad_propia], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            
            // Reemplazamos la ruta con su ID real asignado automáticamente por SQLite (/1/)
            const realPath = `/${this.lastID}/`;
            db.run(`UPDATE afiliados SET ruta_de_red = ? WHERE id = ?`, [realPath, this.lastID], (updateErr) => {
                if (updateErr) return res.status(500).json({ error: updateErr.message });
                res.status(201).json({ message: 'Líder Raíz registrado', id: this.lastID });
            });
        });
    } else {
        // Si tiene patrocinador, buscamos primero la ruta de red del papá
        db.get(`SELECT ruta_de_red FROM afiliados WHERE id = ?`, [id_patrocinador], (err, padre) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!padre) return res.status(400).json({ error: 'El patrocinador seleccionado no existe.' });

            const queryHijo = `INSERT INTO afiliados (nombre, id_patrocinador, ruta_de_red, utilidad_propia) VALUES (?, ?, ?, ?)`;
            db.run(queryHijo, [nombre, id_patrocinador, 'temp', utilidad_propia], function(insertErr) {
                if (insertErr) return res.status(500).json({ error: insertErr.message });

                // La nueva ruta será: ruta_del_padre + id_del_hijo + / (Ej: /1/ -> /1/2/)
                const nuevaRuta = `${padre.ruta_de_red}${this.lastID}/`;
                db.run(`UPDATE afiliados SET ruta_de_red = ? WHERE id = ?`, [nuevaRuta, this.lastID], (pathErr) => {
                    if (pathErr) return res.status(500).json({ error: pathErr.message });
                    res.status(201).json({ message: 'Afiliado registrado con éxito en la red', id: this.lastID });
                });
            });
        });
    }
});

// 3. Obtener balance global de Rentabilidad para el Administrador
app.get('/api/rentabilidad', (req, res) => {
    db.all(`SELECT * FROM afiliados`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        
        const calculados = procesarCalculosMLM(rows);
        const utilidadGlobal = calculados.reduce((sum, u) => sum + u.utilidad_propia, 0);
        const comisionesPagadas = calculados.reduce((sum, u) => sum + u.comision_total, 0);
        const margenLibre = utilidadGlobal - comisionesPagadas;
        const porcentajeRepartido = utilidadGlobal > 0 ? (comisionesPagadas / utilidadGlobal) * 100 : 0;

        res.json({
            utilidadGlobal,
            comisionesPagadas,
            margenLibre,
            porcentajeRepartido: porcentajeRepartido.toFixed(2),
            porcentajeRetenido: (100 - porcentajeRepartido).toFixed(2)
        });
    });
});

// Salud del servidor
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Encender Servidor
app.listen(PORT, () => {
    console.log(`🚀 API Servidor corriendo en http://localhost:${PORT}`);
});