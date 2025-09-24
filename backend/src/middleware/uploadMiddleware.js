const multer = require('multer');
const path = require('path');
const fs = require('fs'); // NOVO: Módulo para operações de sistema de arquivos

// Define o caminho absoluto para a pasta 'uploads'
const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads');

// CRÍTICO: Garante que o diretório de upload exista. 
// Se não existir, ele será criado.
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Configura o armazenamento do Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Usa o caminho absoluto e garantido
        cb(null, UPLOAD_DIR); 
    },
    filename: (req, file, cb) => {
        // Nome do arquivo: 'timestamp-nomeoriginal.ext'
        cb(null, `${Date.now()}-${file.originalname.replace(/\s/g, '-')}`); 
    }
});

// Filtro para aceitar apenas formatos de mídia
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || 
        file.mimetype.startsWith('video/') || 
        file.mimetype.startsWith('audio/')) {
        cb(null, true);
    } else {
        // Opção: Retorna um erro claro para o frontend
        cb(new Error('Tipo de arquivo não permitido.'), false);
    }
};

// Middleware que aceita até 3 campos de arquivo
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 50 }, // 50MB
    fileFilter: fileFilter
}).fields([
    { name: 'media_imagem', maxCount: 1 },
    { name: 'media_audio', maxCount: 1 },
    { name: 'media_video', maxCount: 1 }
]);

module.exports = upload;