const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/login', authController.login);
router.post('/cambiar-clave', authController.cambiarClave);
router.post('/verify-password', authController.verificarPassword);

module.exports = router;