const pool = require('../config/db');

// ADMIN: Criar um novo evento
exports.createEvent = async (req, res) => {
    try {
        const { titulo, descricao, data_evento, local } = req.body;

        if (!titulo || !data_evento || !local) {
            return res.status(400).json({ error: "Título, data e local são obrigatórios." });
        }

        const newEvent = await pool.query(
            'INSERT INTO Eventos (titulo, descricao, data_evento, local) VALUES ($1, $2, $3, $4) RETURNING *',
            [titulo, descricao, data_evento, local]
        );

        res.status(201).json({ message: "Evento criado com sucesso!", event: newEvent.rows[0] });

    } catch (err) {
        console.error("ERRO AO CRIAR EVENTO:", err);
        res.status(500).json({ error: "Erro no servidor ao criar evento.", details: err.message });
    }
};

// PÚBLICO: Listar todos os eventos
exports.getAllEvents = async (req, res) => {
    try {
        // Busca eventos futuros, ordenados por data
        const events = await pool.query(
            'SELECT * FROM Eventos WHERE data_evento >= NOW() - INTERVAL \'1 day\' ORDER BY data_evento ASC'
        );
        res.status(200).json(events.rows);
    } catch (err) {
        console.error("ERRO AO BUSCAR EVENTOS:", err);
        res.status(500).json({ error: "Erro no servidor ao buscar eventos.", details: err.message });
    }
};

// ADMIN: Excluir um evento por ID
exports.deleteEvent = async (req, res) => {
    try {
        const { id } = req.params; 
        
        const result = await pool.query('DELETE FROM Eventos WHERE id = $1 RETURNING id', [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Evento não encontrado." });
        }

        res.status(200).json({ message: `Evento ID ${id} excluído com sucesso.` });

    } catch (err) {
        console.error("ERRO AO EXCLUIR EVENTO:", err);
        res.status(500).json({ error: "Erro no servidor ao excluir evento.", details: err.message });
    }
};
