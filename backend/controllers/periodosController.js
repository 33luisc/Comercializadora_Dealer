const db = require('../config/database');
const { obtenerConfiguracionCompletaBD, procesarCalculosMLMDinamico } = require('../services/mlmService');

// Funciones Helper para promisificar SQLite y simplificar el código
const dbGet = (sql, params = []) => new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => err ? reject(err) : resolve(row));
});

const dbAll = (sql, params = []) => new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => err ? reject(err) : resolve(rows));
});

const dbRun = (sql, params = []) => new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
        err ? reject(err) : resolve(this);
    });
});

exports.cierreMes = async (req, res) => {
    const { periodo } = req.body;

    // 1. Validar formato AAAA-MM
    if (!periodo || !/^\d{4}-\d{2}$/.test(periodo)) {
        return res.status(400).json({ error: 'El formato del periodo debe ser AAAA-MM (Ej: 2026-06).' });
    }

    try {
        // 2. VALIDACIÓN CLAVE: Verificar si el periodo ya fue cerrado previamente
        const yaExiste = await dbGet(
            `SELECT COUNT(*) as count FROM historico_periodos WHERE periodo = ?`, 
            [periodo]
        );

        if (yaExiste && yaExiste.count > 0) {
            return res.status(400).json({ 
                error: `El periodo ${periodo} ya ha sido cerrado previamente y cuenta con un histórico congelado. No es posible duplicar el cierre.` 
            });
        }

        // 3. Obtener configuración MLM y calcular métricas del mes en curso
        const config = await obtenerConfiguracionCompletaBD();
        
        const query = `
            SELECT a.*, COALESCE(SUM(t.monto), 0) as utilidad_propia
            FROM afiliados a
            LEFT JOIN transacciones t ON a.id = t.id_afiliado
            GROUP BY a.id
        `;
        const rows = await dbAll(query);
        
        // CORRECCIÓN 1: Se recibe directamente el Array devuelto por el servicio
        const afiliados = procesarCalculosMLMDinamico(rows, config);

        if (afiliados.length === 0) {
            return res.json({ message: `Periodo ${periodo} procesado sin afiliados activos.` });
        }

        // 4. Ejecutar Transacción de Cierre
        await dbRun("BEGIN TRANSACTION");

        try {
            const insertQuery = `
                INSERT INTO historico_periodos 
                (periodo, id_afiliado, nombre, apellido, cedula, nivel, estado, utilidad_propia, comision_propia, comision_por_red, bono_liderazgo, comision_total)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            // Insertar secuencialmente a cada afiliado
            for (const u of afiliados) {
                await dbRun(insertQuery, [
                    periodo, u.id, u.nombre, u.apellido || '', u.cedula || '', u.nivel, u.estado, 
                    u.utilidad_propia, u.comision_propia, u.comision_por_red, u.bono_liderazgo, u.comision_total
                ]);
            }

            // Limpiar las transacciones del mes activo para reiniciar utilidades a $0
            await dbRun(`DELETE FROM transacciones`);

            // Confirmar cambios
            await dbRun("COMMIT");

            return res.json({ 
                message: `¡Periodo ${periodo} cerrado con éxito! Las utilidades han vuelto a $0 y el histórico ha sido registrado.` 
            });

        } catch (transError) {
            // Revertir cambios si hay un fallo durante la transacción
            await dbRun("ROLLBACK");
            console.error("Error durante la transacción de cierre:", transError);
            return res.status(500).json({ error: 'Error guardando los registros en el histórico. Transacción cancelada.' });
        }

    } catch (err) {
        console.error("Error en cierreMes:", err);
        return res.status(500).json({ error: 'Error interno en el servidor al procesar el cierre de mes.' });
    }
};

exports.obtenerHistoricoPorPeriodo = async (req, res) => {
    try {
        const rows = await dbAll(`SELECT * FROM historico_periodos WHERE periodo = ?`, [req.params.periodo]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.obtenerRentabilidad = async (req, res) => {
    const query = `
        SELECT a.*, COALESCE(SUM(t.monto), 0) as utilidad_propia
        FROM afiliados a
        LEFT JOIN transacciones t ON a.id = t.id_afiliado
        GROUP BY a.id
    `;

    try {
        const config = await obtenerConfiguracionCompletaBD();
        const rows = await dbAll(query);
        
        // CORRECCIÓN 2: Se recibe como Array estándar
        const afiliados = procesarCalculosMLMDinamico(rows, config);
        
        const utilidadGlobal = afiliados.reduce((sum, u) => sum + u.utilidad_propia, 0);
        const comisionesPagadas = afiliados.reduce((sum, u) => sum + u.comision_total, 0);
        const margenLibre = utilidadGlobal - comisionesPagadas;
        const porcentajeRepartido = utilidadGlobal > 0 ? (comisionesPagadas / utilidadGlobal) * 100 : 0;

        // CORRECCIÓN 3: Leemos el monto acumulado directamente del primer elemento del array (inyectado previamente en el servicio)
        const montoSinNivel1 = afiliados.length > 0 ? (afiliados[0]._meta_monto_sin_nivel1 || 0) : 0;

        res.json({
            utilidadGlobal,
            comisionesPagadas,
            margenLibre,
            porcentajeRepartido: porcentajeRepartido.toFixed(2),
            porcentajeRetenido: (100 - porcentajeRepartido).toFixed(2),
            montoSinNivel1
        });
    } catch (err) {
        console.error("Error en obtenerRentabilidad:", err);
        res.status(500).json({ error: 'Error leyendo parámetros del servidor.' });
    }
};