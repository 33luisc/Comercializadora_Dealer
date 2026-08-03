const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const crypto = require('crypto'); // <-- Módulo nativo para cifrado de contraseñas

const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares
app.use(cors());
app.use(express.json());

// ==========================================
// CONEXIÓN Y CREACIÓN DE LA BASE DE DATOS
// ==========================================
const db = new sqlite3.Database('./comercializadora.db', (err) => {
    if (err) {
        console.error('Error al abrir la base de datos:', err.message);
    } else {
        console.log('📦 Conectado con éxito a SQLite (comercializadora.db)');
        db.run('PRAGMA foreign_keys = ON;');
    }
});

// Crear las tablas si no existen y sembrar configuración por defecto
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS afiliados (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            apellido TEXT NOT NULL,
            cedula TEXT UNIQUE NOT NULL,
            celular TEXT NOT NULL,
            correo TEXT UNIQUE,
            id_patrocinador INTEGER,
            ruta_de_red TEXT,
            FOREIGN KEY(id_patrocinador) REFERENCES afiliados(id)
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS transacciones (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            id_afiliado INTEGER NOT NULL,
            monto REAL NOT NULL,
            descripcion TEXT,
            fecha TEXT DEFAULT (datetime('now', 'localtime')),
            FOREIGN KEY(id_afiliado) REFERENCES afiliados(id) ON DELETE CASCADE
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS historico_periodos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            periodo TEXT NOT NULL,
            id_afiliado INTEGER NOT NULL,
            nombre TEXT NOT NULL,
            apellido TEXT NOT NULL,
            cedula TEXT NOT NULL,
            nivel INTEGER DEFAULT 0,
            estado TEXT NOT NULL,
            utilidad_propia REAL DEFAULT 0,
            comision_propia REAL DEFAULT 0,
            comision_por_red REAL DEFAULT 0,
            bono_liderazgo REAL DEFAULT 0,
            comision_total REAL DEFAULT 0
        )
    `);

    // TABLA 1 DE CONFIGURACIÓN GENERAL
    db.run(`
        CREATE TABLE IF NOT EXISTS configuracion_mlm (
            id INTEGER PRIMARY KEY CHECK (id = 1),
            compra_minima_activacion REAL DEFAULT 50000,
            factor_liderazgo REAL DEFAULT 0.1666666667,
            limite_directos_bono INTEGER DEFAULT 15
        )
    `);

    // TABLA 2 DE CONFIGURACIÓN DE NIVELES ESCALONADOS
    db.run(`
        CREATE TABLE IF NOT EXISTS configuracion_niveles (
            nivel INTEGER PRIMARY KEY,
            umbral REAL NOT NULL,
            porcentaje_propio REAL NOT NULL,
            spread_red REAL NOT NULL
        )
    `);

    // TABLA DE USUARIOS ADMINISTRADORES
db.run(`
    CREATE TABLE IF NOT EXISTS usuarios_admin (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario TEXT UNIQUE NOT NULL,
        hash TEXT NOT NULL,
        salt TEXT NOT NULL,
        nombre TEXT NOT NULL,
        rol TEXT DEFAULT 'admin'
    )
`);

// Funciones nativas de cifrado con PBKDF2
function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return { salt, hash };
    }



// CREAR ADMINISTRADOR POR DEFECTO SI NO EXISTE
db.get(`SELECT COUNT(*) as total FROM usuarios_admin`, [], (err, row) => {
    if (!err && row.total === 0) {
        // Usuario inicial: "admin", Contraseña: "admin123"
        const { salt, hash } = hashPassword('admin123');
        db.run(
            `INSERT INTO usuarios_admin (usuario, hash, salt, nombre, rol) VALUES (?, ?, ?, ?, ?)`,
            ['admin', hash, salt, 'Administrador General', 'superadmin'],
            (insErr) => {
                if (!insErr) {
                    console.log('🔑 Usuario administrador inicial creado: [Usuario: admin / Clave: admin123]');
                }
            }
        );
    }
});

    // SEMBRAR VALORES POR DEFECTO (SEED) SI LAS TABLAS ESTÁN VACÍAS
    db.get(`SELECT COUNT(*) as total FROM configuracion_mlm`, [], (err, row) => {
        if (!err && row.total === 0) {
            db.run(`INSERT INTO configuracion_mlm (id, compra_minima_activacion, factor_liderazgo, limite_directos_bono) VALUES (1, 50000, 0.1666666667, 15)`);
        }
    });

    db.get(`SELECT COUNT(*) as total FROM configuracion_niveles`, [], (err, row) => {
        if (!err && row.total === 0) {
            const stmt = db.prepare(`INSERT INTO configuracion_niveles (nivel, umbral, porcentaje_propio, spread_red) VALUES (?, ?, ?, ?)`);
            stmt.run([1, 50000, 0.1666666667, 0.5000000000]);
            stmt.run([2, 400000, 0.3333333333, 0.3333333333]);
            stmt.run([3, 2000000, 0.5000000000, 0.1666666667]);
            stmt.run([4, 6000000, 0.6666666667, 0.0000000000]);
            stmt.finalize();
        }
    });
});

// ==========================================
// FUNCIÓN PARA OBTENER CONFIGURACIÓN DESDE BD
// ==========================================
function obtenerConfiguracionCompletaBD() {
    return new Promise((resolve, reject) => {
        db.get(`SELECT * FROM configuracion_mlm WHERE id = 1`, [], (err, general) => {
            if (err) return reject(err);
            db.all(`SELECT * FROM configuracion_niveles ORDER BY nivel ASC`, [], (errNiveles, niveles) => {
                if (errNiveles) return reject(errNiveles);
                resolve({ general, niveles });
            });
        });
    });
}

// ==========================================
// FUNCIÓN DE LÓGICA MLM DINÁMICA
// ==========================================
function procesarCalculosMLMDinamico(afiliados, config) {
    const { general, niveles } = config;
    const mapaUsuarios = {};
    
    afiliados.forEach(u => { 
        mapaUsuarios[u.id] = `${u.nombre} ${u.apellido}`; 
    });

    const nivelesOrdenadosDesc = [...niveles].sort((a, b) => b.umbral - a.umbral);

    function calcularNivelDinamico(utilidadTotal) {
        const nivelAlcanzado = nivelesOrdenadosDesc.find(n => utilidadTotal >= n.umbral);
        return nivelAlcanzado ? nivelAlcanzado.nivel : 0;
    }

    // 1. CALCULAR UTILIDAD TOTAL DE CALIFICACIÓN
    afiliados.forEach(usuario => {
        usuario.nombre_patrocinador = usuario.id_patrocinador 
            ? (mapaUsuarios[usuario.id_patrocinador] || `ID: ${usuario.id_patrocinador}`) 
            : 'Ninguno (Raíz)';

        const rutaBuscada = usuario.ruta_de_red;
        const descendientes = afiliados.filter(sub => sub.id !== usuario.id && sub.ruta_de_red && sub.ruta_de_red.startsWith(rutaBuscada));
        const utilidadDescendentes = descendientes.reduce((suma, sub) => suma + (sub.utilidad_propia || 0), 0);

        usuario.utilidad_total_calificacion = (usuario.utilidad_propia || 0) + utilidadDescendentes;
        
        // REGLA DE ACTIVACIÓN DINÁMICA
        if (usuario.utilidad_propia >= general.compra_minima_activacion) {
            usuario.estado = "Activo";
            usuario.nivel = calcularNivelDinamico(usuario.utilidad_total_calificacion);
        } else {
            usuario.estado = "Inactivo";
            usuario.nivel = 0;
        }
    });

    
    // 2. CALCULAR COMISIONES INDIVIDUALES
    const nivelMaximoExistente = niveles.length > 0 ? Math.max(...niveles.map(n => n.nivel)) : 4;

    afiliados.forEach(usuario => {
        if (usuario.estado === "Inactivo") {
            usuario.comision_propia = 0;
            usuario.comision_por_red = 0;
            usuario.bono_liderazgo = 0;
            usuario.comision_total = 0;
            return;
        }

        const configNivelUsuario = niveles.find(n => n.nivel === usuario.nivel);
        const porcentajePropio = configNivelUsuario ? configNivelUsuario.porcentaje_propio : 0;

        usuario.comision_propia = usuario.utilidad_propia * porcentajePropio;
        usuario.comision_por_red = 0;
        usuario.bono_liderazgo = 0;

        const descendientes = afiliados.filter(sub => sub.id !== usuario.id && sub.ruta_de_red && sub.ruta_de_red.startsWith(usuario.ruta_de_red));

        descendientes.forEach(desc => {
            const configDesc = niveles.find(n => n.nivel === desc.nivel);
            if (configDesc && configDesc.spread_red) {
                usuario.comision_por_red += desc.utilidad_propia * configDesc.spread_red;
            }
        });

        if (usuario.nivel === nivelMaximoExistente) {
            const nivelesMaxDirectos = afiliados.filter(sub => sub.id_patrocinador === usuario.id && sub.nivel === nivelMaximoExistente);
            const cantidadNivelesMaxDirectos = nivelesMaxDirectos.length;

            if (cantidadNivelesMaxDirectos >= 1) {
                const utilidadNivelesInferiores = descendientes
                    .filter(desc => desc.nivel >= 1 && desc.nivel < nivelMaximoExistente)
                    .reduce((suma, desc) => suma + desc.utilidad_propia, 0);
                
                usuario.bono_liderazgo += utilidadNivelesInferiores * general.factor_liderazgo;

                const limiteDirectos = Math.min(cantidadNivelesMaxDirectos, general.limite_directos_bono);
                for (let i = 3; i <= limiteDirectos; i += 2) {
                    if (nivelesMaxDirectos[i - 1]) {
                        usuario.bono_liderazgo += nivelesMaxDirectos[i - 1].utilidad_propia * general.factor_liderazgo;
                    }
                }
            }
        }

        usuario.comision_total = usuario.comision_propia + usuario.comision_por_red + usuario.bono_liderazgo;
    });

    return afiliados;
}

// ==========================================
// ENDPOINTS DE CONFIGURACIÓN DEL SISTEMA
// ==========================================

// Obtener parámetros de configuración actuales
app.get('/api/configuracion', async (req, res) => {
    try {
        const config = await obtenerConfiguracionCompletaBD();
        res.json(config);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Guardar nueva configuración modificada por el Administrador
app.put('/api/configuracion', (req, res) => {
    const { general, niveles } = req.body;

    if (!general || !niveles || !Array.isArray(niveles)) {
        return res.status(400).json({ error: 'Formato de datos de configuración inválido.' });
    }

    db.serialize(() => {
        db.run("BEGIN TRANSACTION");

        // Actualizar parámetros generales
        db.run(
            `UPDATE configuracion_mlm SET compra_minima_activacion = ?, factor_liderazgo = ?, limite_directos_bono = ? WHERE id = 1`,
            [general.compra_minima_activacion, general.factor_liderazgo, general.limite_directos_bono],
            (err) => {
                if (err) {
                    db.run("ROLLBACK");
                    return res.status(500).json({ error: 'Error actualizando parámetros generales.' });
                }
            }
        );

        // Limpiar niveles anteriores y reemplazarlos por la nueva matriz
        db.run(`DELETE FROM configuracion_niveles`, [], (delErr) => {
            if (delErr) {
                db.run("ROLLBACK");
                return res.status(500).json({ error: 'Error reiniciando niveles.' });
            }

            const stmt = db.prepare(`INSERT INTO configuracion_niveles (nivel, umbral, porcentaje_propio, spread_red) VALUES (?, ?, ?, ?)`);
            let huboError = false;

            niveles.forEach((n) => {
                stmt.run([n.nivel, n.umbral, n.porcentaje_propio, n.spread_red], (insErr) => {
                    if (insErr) huboError = true;
                });
            });

            stmt.finalize();

            if (huboError) {
                db.run("ROLLBACK");
                return res.status(500).json({ error: 'Error insertando nuevos niveles.' });
            }

            db.run("COMMIT");
            res.json({ message: '¡Configuración MLM actualizada correctamente!' });
        });
    });
});

// ==========================================
// ENDPOINTS / RUTAS DE LA API (AJUSTADOS)
// ==========================================

// 1. Obtener todos los afiliados con sus cálculos MLM
app.get('/api/afiliados', async (req, res) => {
    const query = `
        SELECT a.*, COALESCE(SUM(t.monto), 0) as utilidad_propia
        FROM afiliados a
        LEFT JOIN transacciones t ON a.id = t.id_afiliado
        GROUP BY a.id
    `;
    
    try {
        const config = await obtenerConfiguracionCompletaBD();
        db.all(query, [], (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            const calculados = procesarCalculosMLMDinamico(rows, config);
            res.json(calculados);
        });
    } catch (err) {
        res.status(500).json({ error: 'Error al cargar la configuración de la base de datos.' });
    }
});

// 2. Búsqueda de usuarios por cualquier parámetro
app.get('/api/afiliados/buscar', (req, res) => {
    const { q } = req.query;

    if (!q || q.trim() === '') {
        return res.json([]);
    }

    const termino = `%${q.trim()}%`;
    const query = `
        SELECT id, nombre, apellido, cedula, celular, correo, id_patrocinador, ruta_de_red 
        FROM afiliados 
        WHERE id LIKE ? 
           OR nombre LIKE ? 
           OR apellido LIKE ? 
           OR cedula LIKE ? 
           OR celular LIKE ? 
           OR correo LIKE ?
        LIMIT 20
    `;

    db.all(query, [termino, termino, termino, termino, termino, termino], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// 3. Obtener un afiliado por ID
app.get('/api/afiliados/:id', (req, res) => {
    const { id } = req.params;
    db.get(`SELECT id, nombre, apellido, cedula, celular, correo, id_patrocinador FROM afiliados WHERE id = ?`, [id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'Afiliado no encontrado.' });
        res.json(row);
    });
});

// 4. Registrar nuevo afiliado
app.post('/api/afiliados', async (req, res) => {
    const { nombre, apellido, cedula, celular, correo, id_patrocinador } = req.body;

    if (!nombre || nombre.trim() === '') return res.status(400).json({ error: 'El nombre es obligatorio.' });
    if (!apellido || apellido.trim() === '') return res.status(400).json({ error: 'El apellido es obligatorio.' });
    if (!cedula || cedula.trim() === '') return res.status(400).json({ error: 'La cédula es obligatoria.' });
    if (!celular || celular.trim() === '') return res.status(400).json({ error: 'El celular es obligatorio.' });

    const correoLimpio = (correo && correo.trim() !== '') ? correo.trim() : null;
    const idPatrocinadorLimpio = id_patrocinador ? parseInt(id_patrocinador) : null;

    let limiteDirectos = 15;
    try {
        const config = await obtenerConfiguracionCompletaBD();
        limiteDirectos = config.general.limite_directos_bono;
    } catch (e) {
        console.warn("No se pudo cargar límite dinámico, usando por defecto 15.");
    }

    const registrarHijo = (idPadre, rutaPadre) => {
        db.get(`SELECT COUNT(*) as total_directos FROM afiliados WHERE id_patrocinador = ?`, [idPadre], (countErr, row) => {
            if (countErr) return res.status(500).json({ error: countErr.message });
            if (idPadre && row.total_directos >= limiteDirectos) {
                return res.status(400).json({ error: `El patrocinador (ID: ${idPadre}) ya alcanzó el límite máximo de ${limiteDirectos} directos.` });
            }

            const queryInsert = `
                INSERT INTO afiliados (nombre, apellido, cedula, celular, correo, id_patrocinador, ruta_de_red) 
                VALUES (?, ?, ?, ?, ?, ?, 'temp')
            `;

            db.run(queryInsert, [nombre.trim(), apellido.trim(), cedula.trim(), celular.trim(), correoLimpio, idPadre], function(insertErr) {
                if (insertErr) {
                    if (insertErr.message.includes('UNIQUE constraint failed: afiliados.cedula')) {
                        return res.status(400).json({ error: 'La cédula ingresada ya se encuentra registrada.' });
                    }
                    if (insertErr.message.includes('UNIQUE constraint failed: afiliados.correo')) {
                        return res.status(400).json({ error: 'El correo electrónico ingresado ya se encuentra registrado.' });
                    }
                    return res.status(500).json({ error: insertErr.message });
                }

                const newId = this.lastID;
                const nuevaRuta = idPadre ? `${rutaPadre}${newId}/` : `/${newId}/`;

                db.run(`UPDATE afiliados SET ruta_de_red = ? WHERE id = ?`, [nuevaRuta, newId], (pathErr) => {
                    if (pathErr) return res.status(500).json({ error: pathErr.message });
                    res.status(201).json({ 
                        message: 'Afiliado registrado exitosamente.', 
                        id: newId,
                        codigo: newId
                    });
                });
            });
        });
    };

    if (!idPatrocinadorLimpio) {
        registrarHijo(null, null);
    } else {
        db.get(`SELECT id, ruta_de_red FROM afiliados WHERE id = ?`, [idPatrocinadorLimpio], (err, padre) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!padre) return res.status(400).json({ error: `El patrocinador con código/ID ${idPatrocinadorLimpio} no existe.` });
            registrarHijo(idPatrocinadorLimpio, padre.ruta_de_red);
        });
    }
});

// 5. Registrar una transacción
app.post('/api/transacciones', (req, res) => {
    const { id_afiliado, monto, descripcion } = req.body;
    const valor = parseFloat(monto);

    if (!id_afiliado || isNaN(valor)) {
        return res.status(400).json({ error: 'ID de afiliado y un monto válido son requeridos.' });
    }

    const query = `INSERT INTO transacciones (id_afiliado, monto, descripcion) VALUES (?, ?, ?)`;
    db.run(query, [id_afiliado, valor, descripcion || 'Venta registrada'], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: 'Movimiento contable registrado con éxito.', id: this.lastID });
    });
});

// 6. Cierre de Periodo Mensual
app.post('/api/cierre-mes', async (req, res) => {
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

    try {
        const config = await obtenerConfiguracionCompletaBD();

        db.all(query, [], (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            
            const calculados = procesarCalculosMLMDinamico(rows, config);
            
            db.serialize(() => {
                db.run("BEGIN TRANSACTION");

                const stmt = db.prepare(`
                    INSERT INTO historico_periodos 
                    (periodo, id_afiliado, nombre, apellido, cedula, nivel, estado, utilidad_propia, comision_propia, comision_por_red, bono_liderazgo, comision_total)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
                        periodo, u.id, u.nombre, u.apellido || '', u.cedula || '', u.nivel, u.estado, 
                        u.utilidad_propia, u.comision_propia, u.comision_por_red, u.bono_liderazgo, u.comision_total
                    ], (runErr) => {
                        insertsCompletados++;
                        if (runErr) huboError = true;

                        if (insertsCompletados === totalInserts) {
                            stmt.finalize();

                            if (huboError) {
                                db.run("ROLLBACK");
                                return res.status(500).json({ error: 'Error guardando registros en el histórico.' });
                            }

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
    } catch (err) {
        res.status(500).json({ error: 'Error leyendo la configuración del sistema.' });
    }
});

// 7. Ver Historial de un periodo cerrado anterior
app.get('/api/historico/:periodo', (req, res) => {
    db.all(`SELECT * FROM historico_periodos WHERE periodo = ?`, [req.params.periodo], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// 8. Obtener balance global de Rentabilidad
app.get('/api/rentabilidad', async (req, res) => {
    const query = `
        SELECT a.*, COALESCE(SUM(t.monto), 0) as utilidad_propia
        FROM afiliados a
        LEFT JOIN transacciones t ON a.id = t.id_afiliado
        GROUP BY a.id
    `;

    try {
        const config = await obtenerConfiguracionCompletaBD();

        db.all(query, [], (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            
            const calculados = procesarCalculosMLMDinamico(rows, config);
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
    } catch (err) {
        res.status(500).json({ error: 'Error leyendo parámetros del servidor.' });
    }
});

// 9. Eliminar un afiliado de la red
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

// 10. Obtener historial de transacciones detallado de un afiliado
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

// ==========================================
// ENDPOINTS DE AUTENTICACIÓN (LOGIN)
// ==========================================

function verifyPassword(password, salt, originalHash) {
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return hash === originalHash;
    }

// 1. Iniciar Sesión (Login)
app.post('/api/auth/login', (req, res) => {
    const { usuario, password } = req.body;

    if (!usuario || !password) {
        return res.status(400).json({ error: 'Usuario y contraseña son requeridos.' });
    }

    db.get(`SELECT * FROM usuarios_admin WHERE usuario = ?`, [usuario.trim()], (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) {
            return res.status(401).json({ error: 'Credenciales inválidas. Usuario no encontrado.' });
        }

        const esValida = verifyPassword(password, user.salt, user.hash);
        if (!esValida) {
            return res.status(401).json({ error: 'Credenciales inválidas. Contraseña incorrecta.' });
        }

        // Generar un token de sesión simple (puedes guardarlo en localStorage en el frontend)
        const token = crypto.randomBytes(32).toString('hex');

        res.json({
            message: 'Inicio de sesión exitoso.',
            token,
            usuario: {
                id: user.id,
                usuario: user.usuario,
                nombre: user.nombre,
                rol: user.rol
            }
        });
    });
});

// 2. Cambiar contraseña del Administrador
app.put('/api/auth/cambiar-clave', (req, res) => {
    const { usuario, claveActual, nuevaClave } = req.body;

    if (!usuario || !claveActual || !nuevaClave) {
        return res.status(400).json({ error: 'Todos los campos son requeridos.' });
    }

    if (nuevaClave.length < 6) {
        return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres.' });
    }

    db.get(`SELECT * FROM usuarios_admin WHERE usuario = ?`, [usuario], (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(404).json({ error: 'Usuario no encontrado.' });

        const esValida = verifyPassword(claveActual, user.salt, user.hash);
        if (!esValida) {
            return res.status(400).json({ error: 'La contraseña actual es incorrecta.' });
        }

        const { salt, hash } = hashPassword(nuevaClave);
        db.run(`UPDATE usuarios_admin SET hash = ?, salt = ? WHERE id = ?`, [hash, salt, user.id], (updateErr) => {
            if (updateErr) return res.status(500).json({ error: updateErr.message });
            res.json({ message: 'Contraseña actualizada con éxito.' });
        });
    });
});

// Salud del servidor
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