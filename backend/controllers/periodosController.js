const db = require('../config/database');
const { obtenerConfiguracionCompletaBD, procesarCalculosMLMDinamico } = require('../services/mlmService');

exports.cierreMes = async (req, res) => {
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
};

exports.obtenerHistoricoPorPeriodo = (req, res) => {
    db.all(`SELECT * FROM historico_periodos WHERE periodo = ?`, [req.params.periodo], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
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
};