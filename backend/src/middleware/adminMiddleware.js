const pool = require('../config/db');

// Middleware para verificar se o usuário é Pastor ou Desenvolvedor
// A função deve ser exportada diretamente, como você fez.
const adminMiddleware = async (req, res, next) => {
    try {
        // O req.user foi adicionado pelo authMiddleware que rodou antes
        // Usamos desestruturação para garantir que o código não falhe se req.user for undefined
        const userId = req.user ? req.user.id : null; 

        if (!userId) {
            // Se o authMiddleware falhou ou não anexou o user, negamos
            return res.status(401).json({ error: "Token inválido ou sessão expirada." });
        }

        const userRoleQuery = await pool.query(
            // JOIN para buscar o nome do cargo (nome_cargo)
            `SELECT C.nome_cargo 
             FROM "Usuarios" U 
             JOIN "Cargos" C ON U.cargo_id = C.id 
             WHERE U.id = $1`,
            [userId]
        );

        if (userRoleQuery.rows.length === 0) {
            // Isso acontece se o usuário existir, mas não tiver um cargo_id válido
            return res.status(403).json({ error: "Permissão negada. Cargo não definido." });
        }

        const userRole = userRoleQuery.rows[0].nome_cargo;

        // Lista de cargos que podem aprovar devocionais
        const allowedRoles = ['Pastor', 'Desenvolvedor'];

        // Verificamos se o cargo do usuário está na lista de cargos permitidos
        if (allowedRoles.includes(userRole)) {
            next(); // Permissão concedida, pode prosseguir
        } else {
            return res.status(403).json({ error: "Acesso negado. Requer cargo de administrador." });
        }

    } catch (err) {
        console.error('ERRO NO ADMIN MIDDLEWARE:', err);
        // Retorna 500 para erros internos (falha de DB, etc.)
        res.status(500).send("Erro no servidor ao verificar permissões.");
    }
};

module.exports = adminMiddleware;