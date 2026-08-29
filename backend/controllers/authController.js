const crypto = require('crypto');
const db = require('../config/database');
const { hashPassword, verifyPassword } = require('../utils/cryptoUtils');

exports.login = (req, res) => {
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
};

exports.cambiarClave = (req, res) => {
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
};

exports.verificarPassword = (req, res) => {
    // Si envías el 'usuario' desde el frontend (o desde la sesión/token):
    const { usuario, password } = req.body;

    if (!password) {
        return res.status(400).json({ error: 'La contraseña es requerida.' });
    }

    // Si no mandas usuario en el body, se consulta por el usuario por defecto o del token
    const usuarioABuscar = usuario ? usuario.trim() : 'admin'; 

    db.get(`SELECT * FROM usuarios_admin WHERE usuario = ?`, [usuarioABuscar], (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) {
            return res.status(404).json({ error: 'Usuario administrador no encontrado.' });
        }

        // Se usa la función de tu cryptoUtils exactamente igual que en login
        const esValida = verifyPassword(password, user.salt, user.hash);
        
        if (!esValida) {
            return res.status(401).json({ success: false, error: 'Contraseña incorrecta.' });
        }

        return res.json({ success: true, message: 'Contraseña verificada correctamente.' });
    });
};