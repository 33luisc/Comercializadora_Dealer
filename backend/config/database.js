const sqlite3 = require('sqlite3').verbose();
const { hashPassword } = require('../utils/cryptoUtils');

const db = new sqlite3.Database('./comercializadora.db', (err) => {
    if (err) {
        console.error('Error al abrir la base de datos:', err.message);
    } else {
        console.log('📦 Conectado con éxito a SQLite (comercializadora.db)');
        db.run('PRAGMA foreign_keys = ON;');
    }
});

db.serialize(() => {
    // 1. Tabla de Afiliados
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

    // 2. Tabla de Transacciones del Mes Activo
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

    // 3. Tabla de Histórico de Períodos (CORREGIDA Y REFORZADA)
    db.run(`
        CREATE TABLE IF NOT EXISTS historico_periodos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            periodo TEXT NOT NULL, -- Formato AAAA-MM
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
            comision_total REAL DEFAULT 0,
            fecha_cierre TEXT DEFAULT (datetime('now', 'localtime')),
            FOREIGN KEY(id_afiliado) REFERENCES afiliados(id) ON DELETE RESTRICT,
            CONSTRAINT unique_periodo_afiliado UNIQUE (periodo, id_afiliado)
        )
    `);

    // Índice para optimizar búsquedas del historial por mes (Excel, PDF, Vistas)
    db.run(`
        CREATE INDEX IF NOT EXISTS idx_historico_periodo 
        ON historico_periodos (periodo)
    `);

    // 4. Configuración Global MLM
    db.run(`
        CREATE TABLE IF NOT EXISTS configuracion_mlm (
            id INTEGER PRIMARY KEY CHECK (id = 1),
            compra_minima_activacion REAL DEFAULT 50000,
            factor_liderazgo REAL DEFAULT 0.1666666667,
            limite_directos_bono INTEGER DEFAULT 15
        )
    `);

    // 5. Configuración de Niveles y Comisiones
    db.run(`
        CREATE TABLE IF NOT EXISTS configuracion_niveles (
            nivel INTEGER PRIMARY KEY,
            umbral REAL NOT NULL,
            porcentaje_propio REAL NOT NULL,
            spread_red REAL NOT NULL
        )
    `);

    // 6. Usuarios Administradores del Panel
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

    // SEMILLAS DE DATOS INICIALES (SEEDERS)

    // Crear admin inicial si no existe
    db.get(`SELECT COUNT(*) as total FROM usuarios_admin`, [], (err, row) => {
        if (!err && row && row.total === 0) {
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

    // Cargar parámetros por defecto MLM si no existen
    db.get(`SELECT COUNT(*) as total FROM configuracion_mlm`, [], (err, row) => {
        if (!err && row && row.total === 0) {
            db.run(`INSERT INTO configuracion_mlm (id, compra_minima_activacion, factor_liderazgo, limite_directos_bono) VALUES (1, 50000, 0.1666666667, 15)`);
        }
    });

    // Cargar matriz de niveles por defecto si no existen
    db.get(`SELECT COUNT(*) as total FROM configuracion_niveles`, [], (err, row) => {
        if (!err && row && row.total === 0) {
            const stmt = db.prepare(`INSERT INTO configuracion_niveles (nivel, umbral, porcentaje_propio, spread_red) VALUES (?, ?, ?, ?)`);
            
            stmt.run([1, 50000,   0.1666666667, 0.5000000000]);
            stmt.run([2, 400000,  0.3333333333, 0.3333333333]);
            stmt.run([3, 2000000, 0.5000000000, 0.1666666667]);
            stmt.run([4, 6000000, 0.6666666667, 0.0000000000]);
            
            stmt.finalize();
        }
    });
});

module.exports = db;