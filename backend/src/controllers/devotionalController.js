const pool = require('../config/db');

// ADMIN: Quantidade de XP concedida por aprovação
const XP_CONCEDIDO = 50;
const BASE_URL = 'http://localhost:3001/'; // URL base do seu backend

// Função para um usuário LOGADO submeter um novo devocional
exports.submitDevotional = async (req, res) => {
    try {
        const userId = req.user.id; 
        
        // Recebe texto (do req.body)
        const { titulo, conteudo_texto } = req.body;
        
        // Pega o caminho LOCAL dos arquivos que foram salvos pelo Multer
        const url_imagem_path = req.files?.media_imagem?.[0]?.path;
        const url_audio_path = req.files?.media_audio?.[0]?.path;
        const url_video_path = req.files?.media_video?.[0]?.path;
        
        // Corrigido para uma lógica mais robusta de URL
        const buildPublicUrl = (path) => {
            if (!path) return null;
            // O express.static já lida com o prefixo 'uploads', então salvamos apenas o nome do arquivo.
            const filename = path.split('/').pop().split('\\').pop();
            return BASE_URL + 'uploads/' + filename;
        };

        const url_imagem = buildPublicUrl(url_imagem_path);
        const url_audio = buildPublicUrl(url_audio_path);
        const url_video = buildPublicUrl(url_video_path);

        if (!titulo || !conteudo_texto) {
            return res.status(400).json({ error: "Título e conteúdo são obrigatórios." });
        }

        const newDevotional = await pool.query(
            `INSERT INTO devocionais (titulo, conteudo_texto, url_imagem, url_audio, url_video, usuario_id, status) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) 
             RETURNING *`,
            [
                titulo, 
                conteudo_texto, 
                url_imagem, 
                url_audio,  
                url_video,  
                userId, 
                'pendente'
            ]
        );

        res.status(201).json({ 
            message: "Devocional enviado com sucesso! Aguardando aprovação.", 
            devocional: newDevotional.rows[0] 
        });

    } catch (err) {
        console.error("ERRO AO SUBMETER DEVOCIONAL:", err);
        res.status(500).json({ error: "Erro no servidor", details: err.message });
    }
};

// Função PÚBLICA para listar todos os devocionais APROVADOS
exports.getApprovedDevotionals = async (req, res) => {
    try {
        const allDevotionals = await pool.query(
            // Adicionado os campos de mídia na consulta pública
            `SELECT 
                d.id, 
                d.titulo, 
                d.conteudo_texto, 
                d.url_imagem, 
                d.url_audio,  
                d.url_video,
                d.usuario_id,   -- CAMPO ADICIONADO PARA O BOTÃO DE EXCLUIR
                u.nome as autor 
             FROM devocionais d
             JOIN "Usuarios" u ON d.usuario_id = u.id
             WHERE d.status = 'aprovado' 
             ORDER BY d.data_criacao DESC`
        );
        res.status(200).json(allDevotionals.rows);
    } catch (err) {
        console.error("ERRO AO BUSCAR DEVOCIONAIS:", err);
        res.status(500).json({ error: "Erro no servidor", details: err.message });
    }
};

// ADMIN: Listar todos os devocionais PENDENTES
exports.getPendingDevotionals = async (req, res) => {
    // ... (Seu código existente para getPendingDevotionals)
    // Este código está OK, pois já busca nome, cargo, etc.
    try {
        const devocionais = await pool.query(
            `SELECT 
                D.id, D.titulo, D.conteudo_texto, D.data_criacao,
                U.id AS autor_id, U.nome AS autor_nome, C.nome_cargo AS autor_cargo
             FROM devocionais D
             JOIN "Usuarios" U ON D.usuario_id = U.id
             LEFT JOIN "Cargos" C ON U.cargo_id = C.id
             WHERE D.status = $1
             ORDER BY D.data_criacao ASC`,
            ['pendente']
        );
        res.json(devocionais.rows);
    } catch (err) {
        console.error('Erro ao buscar pendentes:', err);
        res.status(500).json({ error: 'Erro ao listar devocionais pendentes.' });
    }
};

// ADMIN: Aprovar um devocional (Corrigido o nome da tabela "Usuarios")
exports.approveDevotional = async (req, res) => {
    try {
        const { id } = req.params; 

        const updateResult = await pool.query(
            "UPDATE devocionais SET status = 'aprovado' WHERE id = $1 RETURNING usuario_id",
            [id]
        );

        if (updateResult.rows.length === 0) {
            return res.status(404).json({ error: "Devocional não encontrado." });
        }

        const userId = updateResult.rows[0].usuario_id;

        // CORREÇÃO: Usando a capitalização correta e aspas duplas para o PostgreSQL
        await pool.query(
            'UPDATE "Usuarios" SET xp_total = xp_total + $1 WHERE id = $2', 
            [XP_CONCEDIDO, userId]
        );

        res.status(200).json({ message: "Devocional aprovado e XP concedido com sucesso!" });

    } catch (err) {
        console.error("ERRO AO APROVAR DEVOCIONAL:", err);
        res.status(500).json({ error: "Erro no servidor", details: err.message });
    }
};

// ADMIN: Rejeitar um devocional
exports.rejectDevotional = async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query("UPDATE devocionais SET status = 'rejeitado' WHERE id = $1", [id]);
        res.status(200).json({ message: "Devocional rejeitado com sucesso." });
    } catch (err) {
        console.error("ERRO AO REJEITAR DEVOCIONAL:", err);
        res.status(500).json({ error: "Erro no servidor", details: err.message });
    }
};

// ADMIN: Excluir um devocional por ID
exports.deleteDevotional = async (req, res) => {
    try {
        const { id } = req.params; 

        // Confirma se o devocional existe antes de tentar deletar
        const result = await pool.query('DELETE FROM devocionais WHERE id = $1 RETURNING id', [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Devocional não encontrado." });
        }

        res.status(200).json({ message: `Devocional ID ${id} excluído com sucesso.` });

    } catch (err) {
        console.error("ERRO AO EXCLUIR DEVOCIONAL:", err);
        res.status(500).json({ error: "Erro no servidor ao excluir devocional." });
    }
};
