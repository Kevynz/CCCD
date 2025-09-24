const express = require('express');
const router = express.Router();
const devotionalController = require('../controllers/devotionalController');
const authMiddleware = require('../middleware/authMiddleware'); 
const adminMiddleware = require('../middleware/adminMiddleware');
const uploadMiddleware = require('../middleware/uploadMiddleware'); // Importe o middleware

// --- Rotas Públicas ---
router.get('/', devotionalController.getApprovedDevotionals);

// --- Rota para Membros Logados ---
// A rota de POST agora tem um middleware de upload
// O Multer é um dos poucos middlewares que processa o corpo da requisição
router.post('/', authMiddleware, uploadMiddleware, devotionalController.submitDevotional);

// --- Rotas de ADMIN ---
router.get('/pending', [authMiddleware, adminMiddleware], devotionalController.getPendingDevotionals);
router.put('/:id/approve', [authMiddleware, adminMiddleware], devotionalController.approveDevotional);
router.put('/:id/reject', [authMiddleware, adminMiddleware], devotionalController.rejectDevotional);
router.delete('/:id', authMiddleware, require('../middleware/canDeleteDevotional'), devotionalController.deleteDevotional);

module.exports = router;