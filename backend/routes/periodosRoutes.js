const express = require('express');
const router = express.Router();
const periodosController = require('../controllers/periodosController');

router.post('/cierre-mes', periodosController.cierreMes);
router.get('/historico/:periodo', periodosController.obtenerHistoricoPorPeriodo);
router.get('/rentabilidad', periodosController.obtenerRentabilidad);

module.exports = router;