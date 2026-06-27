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
    // Creación de un mapa para buscar nombres de patrocinadores rápidamente
    const mapaUsuarios = {};
    afiliados.forEach(u => { mapaUsuarios[u.id] = u.nombre; });

    // 1. CALCULAR UTILIDAD TOTAL DE CALIFICACIÓN
    afiliados.forEach(usuario => {
        // Inyectamos el nombre del patrocinador para el frontend
        usuario.nombre_patrocinador = usuario.id_patrocinador ? (mapaUsuarios[usuario.id_patrocinador] || `ID: ${usuario.id_patrocinador}`) : 'Ninguno (Raíz)';

        const rutaBuscada = `${usuario.ruta_de_red}`;
        const utilidadDescendentes = afiliados
            .filter(sub => sub.id !== usuario.id && sub.ruta_de_red.startsWith(rutaBuscada))
            .reduce((suma, sub) => suma + sub.utilidad_propia, 0);

        usuario.utilidad_total_calificacion = usuario.utilidad_propia + utilidadDescendentes;
        
        // REGLA DE ACTIVACIÓN: Compra mínima $50,000
        if (usuario.utilidad_propia >= 50000) {
            usuario.estado = "Activo";
            usuario.nivel = obtenerNivel(usuario.utilidad_total_calificacion);
        } else {
            usuario.estado = "Inactivo";
            usuario.nivel = 0; // Cae a nivel 0 por no cumplir el mínimo
        }
    });

    // 2. CALCULAR COMISIONES INDIVIDUALES
    afiliados.forEach(usuario => {
        // Si está inactivo, sus comisiones son completamente 0
        if (usuario.estado === "Inactivo") {
            usuario.comision_propia = 0;
            usuario.comision_por_red = 0;
            usuario.bono_liderazgo = 0;
            usuario.comision_total = 0;
            return; // Saltamos al siguiente afiliado
        }

        usuario.comision_propia = usuario.utilidad_propia * (CONFIG_MLM.PORCENTAJES_PROPIOS[usuario.nivel] || 0);
        usuario.comision_por_red = 0;
        usuario.bono_liderazgo = 0;

        const descendientes = afiliados.filter(sub => sub.id !== usuario.id && sub.ruta_de_red.startsWith(usuario.ruta_de_red));

        // Spread de Red (Profundidad ilimitada)
        descendientes.forEach(desc => {
            if (desc.nivel === 1) usuario.comision_por_red += desc.utilidad_propia * CONFIG_MLM.SPREAD_RED[1];
            if (desc.nivel === 2) usuario.comision_por_red += desc.utilidad_propia * CONFIG_MLM.SPREAD_RED[2];
            if (desc.nivel === 3) usuario.comision_por_red += desc.utilidad_propia * CONFIG_MLM.SPREAD_RED[3];
        });

        // Bono de Liderazgo (Solo si es Nivel 4 y tiene directos Nivel 4)
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
// (CON COMPROBACIÓN DE ERRORES Y TOPES)
app.post('/api/afiliados', (req, res) => {
    const { nombre, id_patrocinador, utilidad_propia } = req.body;
    const utilidad = parseFloat(utilidad_propia) || 0;

    // 1. Validación básica de datos de entrada
    if (!nombre || nombre.trim() === '') {
        return res.status(400).json({ error: 'El nombre del afiliado es obligatorio.' });
    }
    if (utilidad < 0) {
        return res.status(400).json({ error: 'La utilidad no puede ser un valor negativo.' });
    }

    // CASO A: Es un Líder Raíz (Sin patrocinador)
    if (!id_patrocinador) {
        const queryRaiz = `INSERT INTO afiliados (nombre, id_patrocinador, ruta_de_red, utilidad_propia) VALUES (?, null, ?, ?)`;
        db.run(queryRaiz, [nombre, 'temp', utilidad], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            
            const realPath = `/${this.lastID}/`;
            db.run(`UPDATE afiliados SET ruta_de_red = ? WHERE id = ?`, [realPath, this.lastID], (updateErr) => {
                if (updateErr) return res.status(500).json({ error: updateErr.message });
                return res.status(201).json({ message: 'Líder Raíz registrado con éxito', id: this.lastID });
            });
        });
    } 
    // CASO B: Tiene Patrocinador Directo
    else {
        const idPatrocinadorInt = parseInt(id_patrocinador);

        // 2. Validación de consistencia: No puede ser su propio patrocinador
        // Nota: En la creación esto se previene porque el ID nuevo aún no existe, 
        // pero lo dejamos listo como buena práctica de control lógico.
        
        // 3. Verificar si el patrocinador existe y cuántos directos tiene actualmente
        db.get(`SELECT ruta_de_red FROM afiliados WHERE id = ?`, [idPatrocinadorInt], (err, padre) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!padre) return res.status(400).json({ error: 'El patrocinador seleccionado no existe en el sistema.' });

            // Contar cuántos hijos directos tiene ya ese patrocinador
            db.get(`SELECT COUNT(*) as total_directos FROM afiliados WHERE id_patrocinador = ?`, [idPatrocinadorInt], (countErr, row) => {
                if (countErr) return res.status(500).json({ error: countErr.message });

                // REGLA DEL NEGOCIO: Máximo 15 referidos directos
                if (row.total_directos >= 15) {
                    return res.status(400).json({ 
                        error: `Validación MLM: El patrocinador (ID: ${idPatrocinadorInt}) ya alcanzó el límite máximo de 15 referidos directos.` 
                    });
                }

                // Si pasa todas las aduanas, procedemos a insertar el registro
                const queryHijo = `INSERT INTO afiliados (nombre, id_patrocinador, ruta_de_red, utilidad_propia) VALUES (?, ?, ?, ?)`;
                db.run(queryHijo, [nombre, idPatrocinadorInt, 'temp', utilidad], function(insertErr) {
                    if (insertErr) return res.status(500).json({ error: insertErr.message });

                    const nuevaRuta = `${padre.ruta_de_red}${this.lastID}/`;
                    db.run(`UPDATE afiliados SET ruta_de_red = ? WHERE id = ?`, [nuevaRuta, this.lastID], (pathErr) => {
                        if (pathErr) return res.status(500).json({ error: pathErr.message });
                        return res.status(201).json({ message: 'Afiliado registrado con éxito en la red', id: this.lastID });
                    });
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