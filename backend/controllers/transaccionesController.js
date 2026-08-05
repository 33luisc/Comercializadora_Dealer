const db = require('../config/database');

exports.registrarTransaccion = (req, res) => {
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
};

exports.obtenerTransaccionesPorAfiliado = (req, res) => {
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
};