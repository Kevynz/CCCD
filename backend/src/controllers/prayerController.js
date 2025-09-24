const pool = require('../config/db');

exports.getPrayers = async (req, res) => {
    try {
        console.log('=== BUSCANDO ORAÇÕES ===');
        
        const prayers = await pool.query(`
            SELECT p.id, p.pedido_texto, p.eh_anonimo, u.nome as autor, p.data_criacao
            FROM pedidosoracao p
            LEFT JOIN "Usuarios" u ON p.usuario_id = u.id
            ORDER BY p.data_criacao DESC
        `);

        console.log('Orações encontradas:', prayers.rows.length);

        const formattedPrayers = prayers.rows.map(p => ({
            ...p,
            autor: p.eh_anonimo ? "Um irmão(ã)" : p.autor
        }));
        
        res.status(200).json(formattedPrayers);
        
    } catch (err) {
        console.error("ERRO AO BUSCAR ORAÇÕES:", err);
        res.status(500).json({ error: "Erro no servidor", details: err.message });
    }
};

exports.submitPrayer = async (req, res) => {
    try {
        const userId = req.user.id;
        const { pedido_texto, eh_anonimo } = req.body;
        
        // Converte o valor de 'eh_anonimo' para um booleano real (se vier como string)
        const isAnonymous = eh_anonimo === true || eh_anonimo === 'true';

        if (!pedido_texto) {
            return res.status(400).json({ error: "O texto do pedido é obrigatório." });
        }

        // Se o pedido for anônimo, o usuario_id inserido é NULL. Caso contrário, é o userId.
        const finalUserId = isAnonymous ? null : userId;
        
        const newPrayer = await pool.query(
            'INSERT INTO pedidosoracao (pedido_texto, eh_anonimo, usuario_id) VALUES ($1, $2, $3) RETURNING *',
            [pedido_texto, isAnonymous, finalUserId] 
        );
        
        res.status(201).json({ 
            message: "Pedido de oração enviado com sucesso!",
            prayer: newPrayer.rows[0]
        });
        
    } catch (err) {
        console.error("ERRO AO CRIAR ORAÇÃO:", err);
        res.status(500).json({ error: "Erro no servidor", details: err.message });
    }
};

// ADMIN: Excluir um pedido de oração por ID
exports.deletePrayer = async (req, res) => {
    try {
        const { id } = req.params; 
        
        // Deleta da tabela PedidosOracao
        const result = await pool.query('DELETE FROM pedidosoracao WHERE id = $1 RETURNING id', [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Pedido de oração não encontrado." });
        }

        res.status(200).json({ message: `Pedido de oração ID ${id} excluído com sucesso.` });

    } catch (err) {
        console.error("ERRO AO EXCLUIR ORAÇÃO:", err);
        res.status(500).json({ error: "Erro no servidor ao excluir oração." });
    }
};