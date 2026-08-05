const express = require('express');
const router = express.Router();
const transaccionesController = require('../controllers/transaccionesController');

router.post('/', transaccionesController.registrarTransaccion);
router.get('/:id_afiliado', transaccionesController.obtenerTransaccionesPorAfiliado);

module.exports = router;