// Seed do servidor backend do Document Management System.
//
// Este arquivo é apenas um ponto de partida mínimo. Ao longo do workshop você
// vai usar o Agent Mode do GitHub Copilot para construir as camadas:
//   - routes/       (definição das rotas)
//   - controllers/  (entrada HTTP e validação)
//   - services/     (regras de negócio)
//   - repositories/ (persistência: arquivos locais + metadados em memória)
//
// Restrição do projeto: uploads são gravados no filesystem local da aplicação
// usando multer com diskStorage. Não utilize provedores externos.

const express = require('express');
const documentController = require('./controllers/documentController');
const documentRepository = require('./repositories/documentRepository');
const { createDocumentRouter } = require('./routes/documentRoutes');
const documentService = require('./services/documentService');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const controller = {
  download: documentController.createDownloadDocument(
    documentService,
    documentRepository
  ),
  list: documentController.createListDocuments(documentService, documentRepository),
  requireOwner: documentController.requireOwner,
  upload: documentController.createUploadDocument(documentService, documentRepository),
};

app.use(createDocumentRouter(controller));

// Endpoint de verificação de saúde. As demais rotas (/upload, /documents,
// /documents/:id/download) serão implementadas durante o Passo 2.
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use((error, req, res, next) => {
  if (error.code === 'LIMIT_FILE_SIZE') {
    res.status(413).json({
      error: {
        code: 'FILE_TOO_LARGE',
        message: 'O arquivo deve ter no máximo 50 MiB.',
      },
    });
    return;
  }

  next(error);
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`DMS backend ouvindo na porta ${PORT}`);
  });
}

module.exports = app;
