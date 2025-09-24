const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
    console.log('=== MIDDLEWARE AUTH EXECUTANDO ===');
    
    // Pega o token do cabeçalho da requisição
    const token = req.header('x-auth-token');
    
    console.log('Token recebido:', token ? 'Existe' : 'Não existe');

    // Se não houver token, negue o acesso
    if (!token) {
        console.log('ERRO: Nenhum token fornecido');
        return res.status(401).json({ error: 'Acesso negado. Nenhum token fornecido.' });
    }

    try {
        // Se o token for válido, o jwt.verify vai decodificá-lo
        const jwtSecret = process.env.JWT_SECRET || 'SEGREDO_SUPER_SECRETO_PARA_PRODUCAO';
        const decoded = jwt.verify(token, jwtSecret);
        
        console.log('Token decodificado com sucesso:', decoded);

        // Adicionamos o payload decodificado (que tem o ID do usuário) ao objeto 'req'
        req.user = decoded;

        // Passa para a próxima função (o controller)
        next();
        
    } catch (ex) {
        console.log('ERRO: Token inválido -', ex.message);
        res.status(400).json({ error: 'Token inválido.' });
    }
};