const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// Rota para listar todos os eventos (PÚBLICA)
router.get('/', eventController.getAllEvents);

// Rota para criar um novo evento (APENAS ADMIN)
router.post('/', authMiddleware, adminMiddleware, eventController.createEvent);

// Rota para EXCLUIR um evento (APENAS ADMIN)
router.delete('/:id', authMiddleware, adminMiddleware, eventController.deleteEvent);

module.exports = router;
