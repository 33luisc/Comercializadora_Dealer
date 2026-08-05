const express = require('express');
const router = express.Router();
const afiliadosController = require('../controllers/afiliadosController');

router.get('/', afiliadosController.obtenerAfiliados);
router.get('/buscar', afiliadosController.buscarAfiliados);
router.get('/:id', afiliadosController.obtenerAfiliadoPorId);
router.post('/', afiliadosController.registrarAfiliado);
router.delete('/:id', afiliadosController.eliminarAfiliado);

module.exports = router;