const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// Rota para registro -> POST /api/auth/register
router.post('/register', authController.registerUser);

// Rota para login -> POST /api/auth/login
router.post('/login', authController.loginUser);

// Rota protegida para buscar perfil do usuário
router.get('/profile', authMiddleware, authController.getUserProfile);

// Rota PÚBLICA para o ranking (Leaderboard) -> GET /api/auth/ranking
router.get('/ranking', authController.getRanking);


module.exports = router;