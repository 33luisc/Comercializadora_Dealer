const db = require('../config/database');
const { obtenerConfiguracionCompletaBD } = require('../services/mlmService');

exports.obtenerConfiguracion = async (req, res) => {
    try {
        const config = await obtenerConfiguracionCompletaBD();
        res.json(config);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.guardarConfiguracion = (req, res) => {
    const { general, niveles } = req.body;

    if (!general || !niveles || !Array.isArray(niveles)) {
        return res.status(400).json({ error: 'Formato de datos de configuración inválido.' });
    }

    db.serialize(() => {
        db.run("BEGIN TRANSACTION");

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
};