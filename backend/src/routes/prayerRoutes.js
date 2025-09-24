const express = require('express');
const router = express.Router();
const prayerController = require('../controllers/prayerController');
const authMiddleware = require('../middleware/authMiddleware'); //seguranca
const adminMiddleware = require('../middleware/adminMiddleware');

// GET /api/prayers - Rota protegida!
router.get('/', authMiddleware, prayerController.getPrayers);
router.post('/', authMiddleware, prayerController.submitPrayer);

// Rota para EXCLUIR um pedido de oração (DELETE /api/prayers/:id)
router.delete('/:id', authMiddleware, adminMiddleware, prayerController.deletePrayer);

module.exports = router;