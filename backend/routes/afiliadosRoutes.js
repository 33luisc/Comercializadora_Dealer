const express = require('express');
const router = express.Router();
const multer = require('multer');
const afiliadosController = require('../controllers/afiliadosController');

// Guardar temporalmente en la carpeta uploads
const upload = multer({ dest: 'uploads/' });

router.get('/', afiliadosController.obtenerAfiliados);
router.get('/buscar', afiliadosController.buscarAfiliados);
router.get('/:id', afiliadosController.obtenerAfiliadoPorId);
router.post('/', afiliadosController.registrarAfiliado);
router.delete('/:id', afiliadosController.eliminarAfiliado);

// Nueva ruta de importación masiva
router.post('/importar-csv', upload.single('file'), afiliadosController.importarAfiliadosCSV);

module.exports = router;