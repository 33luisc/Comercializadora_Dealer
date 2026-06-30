const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const PORT = process.env.PORT || 4000;

// CONFIGURACIÓN MLM (Reglas del negocio modificables)
const CONFIG_MLM = {
    UMBRALES: { 1: 50000, 2: 400000, 3: 2000000, 4: 6000000 },
    PORCENTAJES_PROPIOS: { 1: 1/6, 2: 2/6, 3: 3/6, 4: 4/6 },
    SPREAD_RED: { 1: 1/2, 2: 2/6, 3: 1/6 },
    FACTOR_LIDERAZGO: 1/6
};

// Middlewares
app.use(cors());
app.use(express.json());

// ==========================================
// CONEXIÓN Y CREACIÓN DE LA BASE DE DATOS
// ==========================================
const db = new sqlite3.Database('./comercializadora.db', (err) => {
    if (err) console.error('Error al abrir la base de datos:', err.message);
    else console.log('📦 Conectado con éxito a SQLite (comercializadora.db)');
});

// Crear las tablas si no existen
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS afiliados (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            id_patrocinador INTEGER,
            ruta_de_red TEXT
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS transacciones (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            id_afiliado INTEGER NOT NULL,
            monto REAL NOT NULL,
            descripcion TEXT,
            fecha TEXT DEFAULT (datetime('now', 'localtime')),
            FOREIGN KEY(id_afiliado) REFERENCES afiliados(id)
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS historico_periodos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            periodo TEXT NOT NULL,
            id_afiliado INTEGER NOT NULL,
            nombre TEXT NOT NULL,
            nivel INTEGER DEFAULT 0,
            estado TEXT NOT NULL,
            utilidad_propia REAL DEFAULT 0,
            comision_propia REAL DEFAULT 0,
            comision_por_red REAL DEFAULT 0,
            bono_liderazgo REAL DEFAULT 0,
            comision_total REAL DEFAULT 0
        )
    `);
});

// ==========================================
// FUNCIÓN DE LÓGICA MLM
// ==========================================
function obtenerNivel(utilidadTotal) {
    if (utilidadTotal >= CONFIG_MLM.UMBRALES[4]) return 4;
    if (utilidadTotal >= CONFIG_MLM.UMBRALES[3]) return 3;
    if (utilidadTotal >= CONFIG_MLM.UMBRALES[2]) return 2;
    if (utilidadTotal >= CONFIG_MLM.UMBRALES[1]) return 1;
    return 0;
}

function procesarCalculosMLM(afiliados) {
    const mapaUsuarios = {};
    afiliados.forEach(u => { mapaUsuarios[u.id] = u.nombre; });

    // 1. CALCULAR UTILIDAD TOTAL DE CALIFICACIÓN
    afiliados.forEach(usuario => {
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
            usuario.nivel = 0;
        }
    });

    // 2. CALCULAR COMISIONES INDIVIDUALES
    afiliados.forEach(usuario => {
        if (usuario.estado === "Inactivo") {
            usuario.comision_propia = 0;
            usuario.comision_por_red = 0;
            usuario.bono_liderazgo = 0;
            usuario.comision_total = 0;
            return;
        }

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

// 1. Obtener afiliados con utilidad calculada
app.get('/api/afiliados', (req, res) => {
    const query = `
        SELECT a.*, COALESCE(SUM(t.monto), 0) as utilidad_propia
        FROM afiliados a
        LEFT JOIN transacciones t ON a.id = t.id_afiliado
        GROUP BY a.id
    `;
    
    db.all(query, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        const calculados = procesarCalculosMLM(rows);
        res.json(calculados);
    });
});

// 2. Registrar nuevo afiliado
app.post('/api/afiliados', (req, res) => {
    const { nombre, id_patrocinador } = req.body;

    if (!nombre || nombre.trim() === '') {
        return res.status(400).json({ error: 'El nombre del afiliado es obligatorio.' });
    }

    const registrarHijo = (idPadre, rutaPadre) => {
        db.get(`SELECT COUNT(*) as total_directos FROM afiliados WHERE id_patrocinador = ?`, [idPadre], (countErr, row) => {
            if (countErr) return res.status(500).json({ error: countErr.message });
            if (idPadre && row.total_directos >= 15) {
                return res.status(400).json({ error: `El patrocinador (ID: ${idPadre}) ya alcanzó el límite de 15 directos.` });
            }

            const queryInsert = `INSERT INTO afiliados (nombre, id_patrocinador, ruta_de_red) VALUES (?, ?, 'temp')`;
            db.run(queryInsert, [nombre, idPadre], function(insertErr) {
                if (insertErr) return res.status(500).json({ error: insertErr.message });

                const nuevaRuta = idPadre ? `${rutaPadre}${this.lastID}/` : `/${this.lastID}/`;
                db.run(`UPDATE afiliados SET ruta_de_red = ? WHERE id = ?`, [nuevaRuta, this.lastID], (pathErr) => {
                    if (pathErr) return res.status(500).json({ error: pathErr.message });
                    res.status(201).json({ message: 'Afiliado registrado', id: this.lastID });
                });
            });
        });
    };

    if (!id_patrocinador) {
        registrarHijo(null, null);
    } else {
        db.get(`SELECT ruta_de_red FROM afiliados WHERE id = ?`, [parseInt(id_patrocinador)], (err, padre) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!padre) return res.status(400).json({ error: 'El patrocinador no existe.' });
            registrarHijo(parseInt(id_patrocinador), padre.ruta_de_red);
        });
    }
});

// 3. Registrar una transacción
app.post('/api/transacciones', (req, res) => {
    const { id_afiliado, monto, descripcion } = req.body;
    const valor = parseFloat(monto);

    if (!id_afiliado || isNaN(valor)) {
        return res.status(400).json({ error: 'ID de afiliado y monto válido son requeridos.' });
    }

    const query = `INSERT INTO transacciones (id_afiliado, monto, descripcion) VALUES (?, ?, ?)`;
    db.run(query, [id_afiliado, valor, descripcion || 'Venta registrada'], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: 'Movimiento contable registrado con éxito.', id: this.lastID });
    });
});

// 4. CORREGIDO: Cierre de Periodo Mensual con promesas/concurrencia segura
app.post('/api/cierre-mes', (req, res) => {
    const { periodo } = req.body;

    if (!periodo || !/^\d{4}-\d{2}$/.test(periodo)) {
        return res.status(400).json({ error: 'El formato del periodo debe ser AAAA-MM (Ej: 2026-06).' });
    }

    const query = `
        SELECT a.*, COALESCE(SUM(t.monto), 0) as utilidad_propia
        FROM afiliados a
        LEFT JOIN transacciones t ON a.id = t.id_afiliado
        GROUP BY a.id
    `;

    db.all(query, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        
        const calculados = procesarCalculosMLM(rows);
        
        db.serialize(() => {
            db.run("BEGIN TRANSACTION");

            const stmt = db.prepare(`
                INSERT INTO historico_periodos 
                (periodo, id_afiliado, nombre, nivel, estado, utilidad_propia, comision_propia, comision_por_red, bono_liderazgo, comision_total)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);

            let totalInserts = calculados.length;
            let insertsCompletados = 0;
            let huboError = false;

            if (totalInserts === 0) {
                db.run("COMMIT");
                return res.json({ message: `Periodo ${periodo} cerrado sin afiliados activos.` });
            }

            calculados.forEach(u => {
                stmt.run([
                    periodo, u.id, u.nombre, u.nivel, u.estado, 
                    u.utilidad_propia, u.comision_propia, u.comision_por_red, u.bono_liderazgo, u.comision_total
                ], (runErr) => {
                    insertsCompletados++;
                    if (runErr) huboError = true;

                    // Una vez que TODOS los inserts asíncronos finalizaron con éxito:
                    if (insertsCompletados === totalInserts) {
                        stmt.finalize();

                        if (huboError) {
                            db.run("ROLLBACK");
                            return res.status(500).json({ error: 'Error guardando registros en el histórico.' });
                        }

                        // Eliminamos transacciones actuales
                        db.run(`DELETE FROM transacciones`, [], (delErr) => {
                            if (delErr) {
                                db.run("ROLLBACK");
                                return res.status(500).json({ error: 'Error al limpiar el mes en curso' });
                            }
                            
                            db.run("COMMIT");
                            res.json({ message: `¡Periodo ${periodo} cerrado con éxito! Las utilidades han vuelto a $0.` });
                        });
                    }
                });
            });
        });
    });
});

// 5. Ver Historial de un periodo cerrado anterior
app.get('/api/historico/:periodo', (req, res) => {
    db.all(`SELECT * FROM historico_periodos WHERE periodo = ?`, [req.params.periodo], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// 6. Obtener balance global de Rentabilidad
app.get('/api/rentabilidad', (req, res) => {
    const query = `
        SELECT a.*, COALESCE(SUM(t.monto), 0) as utilidad_propia
        FROM afiliados a
        LEFT JOIN transacciones t ON a.id = t.id_afiliado
        GROUP BY a.id
    `;

    db.all(query, [], (err, rows) => {
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

// 7. Eliminar un afiliado de la red
app.delete('/api/afiliados/:id', (req, res) => {
    const { id } = req.params;

    db.get(`SELECT COUNT(*) as hijos FROM afiliados WHERE id_patrocinador = ?`, [id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (row.hijos > 0) {
            return res.status(400).json({ 
                error: 'No se puede eliminar este afiliado porque tiene una red dependiente debajo de él. Primero reasigna o elimina a sus referidos.' 
            });
        }

        db.run(`DELETE FROM afiliados WHERE id = ?`, [id], function(deleteErr) {
            if (deleteErr) return res.status(500).json({ error: deleteErr.message });
            res.json({ message: 'Afiliado removido de la red con éxito.' });
        });
    });
});

// 8. Obtener el historial de transacciones detallado de un afiliado
app.get('/api/transacciones/:id_afiliado', (req, res) => {
    const { id_afiliado } = req.params;

    const query = `
        SELECT id, monto, descripcion, fecha 
        FROM transacciones 
        WHERE id_afiliado = ? 
        ORDER BY fecha DESC
    `;

    db.all(query, [id_afiliado], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Salud del servidor
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Cierre limpio de base de datos al apagar el servidor
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