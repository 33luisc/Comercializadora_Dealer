const db = require('../config/database');
const { obtenerConfiguracionCompletaBD, procesarCalculosMLMDinamico } = require('../services/mlmService');

exports.obtenerAfiliados = async (req, res) => {
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
};

exports.buscarAfiliados = (req, res) => {
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
};

exports.obtenerAfiliadoPorId = (req, res) => {
    const { id } = req.params;
    db.get(`SELECT id, nombre, apellido, cedula, celular, correo, id_patrocinador FROM afiliados WHERE id = ?`, [id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'Afiliado no encontrado.' });
        res.json(row);
    });
};

exports.registrarAfiliado = async (req, res) => {
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
};

exports.eliminarAfiliado = (req, res) => {
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
};