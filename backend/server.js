const express = require('express');
const cors = require('cors');
require('dotenv').config();
const path = require('path');
const app = express();

// --- MIDDLEWARES DE BASE E SEGURANÇA ---
app.use(cors({
    origin: 'http://localhost:3000', // URL do seu React
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'x-auth-token', 'Authorization']
}));

// 1. SERVIR ARQUIVOS ESTÁTICOS (UPLOAD)
// Mova esta linha para cá. O frontend acessará arquivos em: http://localhost:3001/uploads/nome-do-arquivo.jpg
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); 

// 2. PARSERS DE CORPO (JSON e URL-encoded)
// Estes parsers devem vir depois do 'static' mas antes das rotas de API.
// O Multer (que lida com o upload) virá DENTRO da rota /api/devotionals.
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

// Middleware de log para debug
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});

// Rota de teste
app.get('/', (req, res) => {
    res.json({ message: 'Servidor backend funcionando!' });
});

// --- IMPORTAR E USAR ROTAS ---
try {
    const authRoutes = require('./src/routes/authRoutes');
    app.use('/api/auth', authRoutes);
    console.log('✅ Rotas de auth carregadas');
} catch (error) {
    console.log('❌ Erro ao carregar rotas de auth:', error.message);
}

try {
    const devotionalRoutes = require('./src/routes/devotionalRoutes');
    app.use('/api/devotionals', devotionalRoutes);
    console.log('✅ Rotas de devocionais carregadas');
} catch (error) {
    console.log('❌ Erro ao carregar rotas de devocionais:', error.message);
}

try {
    const prayerRoutes = require('./src/routes/prayerRoutes');
    app.use('/api/prayers', prayerRoutes);
    console.log('✅ Rotas de orações carregadas');
} catch (error) {
    console.log('❌ Erro ao carregar rotas de orações:', error.message);
}

try {
    const eventRoutes = require('./src/routes/eventRoutes');
    app.use('/api/events', eventRoutes);
    console.log('✅ Rotas de eventos carregadas');
} catch (error) {
    console.log('❌ Erro ao carregar rotas de eventos:', error.message);
}

// --- TRATAMENTO DE ERROS FINAIS ---

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
    console.error('Erro no servidor:', err.stack);
    res.status(500).json({ 
        error: 'Algo deu errado!', 
        message: err.message
    });
});

// Middleware para rotas não encontradas
app.use((req, res) => {
    res.status(404).json({ error: `Rota ${req.originalUrl} não encontrada` });
});

// --- INICIALIZAÇÃO DO SERVIDOR ---
const PORT = process.env.PORT || 3001;

// Iniciar o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Frontend deve acessar: http://localhost:${PORT}`);
    console.log(`Teste em: http://localhost:${PORT}/`);
});

module.exports = app;