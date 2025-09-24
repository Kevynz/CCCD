const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Função para registrar um novo usuário
exports.registerUser = async (req, res) => {
    try {
        const { nome, email, senha } = req.body;

        const userExists = await pool.query('SELECT * FROM "Usuarios" WHERE email = $1', [email]);
        
        if (userExists.rows.length > 0) {
            return res.status(400).json({ error: "Este email já está em uso." });
        }

        const salt = await bcrypt.genSalt(10);
        const senhaHash = await bcrypt.hash(senha, salt);

        const newUser = await pool.query(
            'INSERT INTO "Usuarios" (nome, email, senha_hash) VALUES ($1, $2, $3) RETURNING id, nome, email',
            [nome, email, senhaHash]
        );

        res.status(201).json({ message: "Usuário criado com sucesso!", user: newUser.rows[0] });

    } catch (err) {
        console.error("ERRO DETALHADO NO CADASTRO:", err); 
        res.status(500).json({ error: "Erro no servidor", details: err.message });
    }
};

// Função para fazer login
exports.loginUser = async (req, res) => {
    try {
        const { email, senha } = req.body;

        const userResult = await pool.query('SELECT * FROM "Usuarios" WHERE email = $1', [email]);

        if (userResult.rows.length === 0) {
            return res.status(401).json({ error: "Credenciais inválidas" });
        }

        const usuario = userResult.rows[0];
        const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);

        if (!senhaValida) {
            return res.status(401).json({ error: "Credenciais inválidas" });
        }

        // Usar variável de ambiente ou fallback
        const jwtSecret = process.env.JWT_SECRET || 'SEGREDO_SUPER_SECRETO_PARA_PRODUCAO';

        const token = jwt.sign(
            { 
                id: usuario.id, 
                nome: usuario.nome,
                email: usuario.email,
                cargo_id: usuario.cargo_id 
            },
            jwtSecret,
            { expiresIn: '24h' }
        );

        res.status(200).json({
            message: "Login bem-sucedido!",
            token: token,
            user: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email
            }
        });

    } catch (err) {
        console.error("ERRO DETALHADO NO LOGIN:", err);
        res.status(500).json({ error: "Erro no servidor", details: err.message });
    }
};

// Função para buscar perfil do usuário logado (DENTRO de authController.js)
exports.getUserProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        
        console.log('Buscando perfil do usuário:', userId);
        
        // CORREÇÃO 1: Removida a coluna 'data_criacao' (pois não existe na sua DDL de Usuarios)
        // Você pode adicionar a coluna no DB, mas por enquanto, removemos do SELECT para funcionar.
        const user = await pool.query(
        'SELECT id, nome, email, cargo_id, xp_total, nivel, data_criacao FROM "Usuarios" WHERE id = $1',
        [userId]
        );

        
        if (user.rows.length === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }
        
        const userData = user.rows[0];
        console.log('Usuário encontrado:', userData);
        
        let cargoNome = 'Membro';
        if (userData.cargo_id) {
            try {
                // CORREÇÃO 2: A coluna correta é 'nome_cargo' e não 'nome'
                const cargo = await pool.query('SELECT nome_cargo FROM "Cargos" WHERE id = $1', [userData.cargo_id]);
                
                if (cargo.rows.length > 0) {
                    // Também corrigido o acesso ao resultado para usar nome_cargo
                    cargoNome = cargo.rows[0].nome_cargo; 
                }
            } catch (cargoErr) {
                console.log('Erro ao buscar cargo, usando padrão:', cargoErr.message);
            }
        }

        res.status(200).json({
            id: userData.id,
            nome: userData.nome,
            email: userData.email,
            cargo: cargoNome,
            xp_total: userData.xp_total || 0,
            data_criacao: userData.data_criacao
        });
        
    } catch (err) {
        console.error('Erro ao buscar perfil:', err);
        res.status(500).json({ error: 'Erro no servidor', details: err.message });
    }
};

// Função para buscar o ranking global de usuários
exports.getRanking = async (req, res) => {
    try {
        // Seleciona nome, xp_total e cargo (para mostrar quem está no topo)
        const ranking = await pool.query(
            `SELECT 
                U.nome, 
                U.xp_total, 
                U.nivel,
                C.nome_cargo AS cargo
             FROM "Usuarios" U
             LEFT JOIN "Cargos" C ON U.cargo_id = C.id
             ORDER BY U.xp_total DESC, U.nivel DESC
             LIMIT 100`
        );
        
        res.status(200).json(ranking.rows);
    } catch (err) {
        console.error("ERRO AO BUSCAR RANKING:", err);
        res.status(500).json({ error: "Erro no servidor ao buscar ranking." });
    }
};