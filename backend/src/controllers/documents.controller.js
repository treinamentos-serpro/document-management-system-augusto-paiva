const fs = require('fs');

function requireOwner(req, res, next) {
  if (req.get('x-owner-id')) {
    next();
    return;
  }

  res.status(400).json({
    error: {
      code: 'OWNER_REQUIRED',
      message: 'Informe o cabeçalho x-owner-id.',
    },
  });
}

function createUploadDocument(documentService, documentRepository) {
  return (req, res) => {
    if (!req.file) {
      res.status(400).json({
        error: {
          code: 'FILE_REQUIRED',
          message: 'Envie um arquivo no campo file.',
        },
      });
      return;
    }

    const document = documentService.createDocument(
      req.file,
      req.get('x-owner-id'),
      documentRepository
    );

    res.status(201).json(documentService.toMetadata(document));
  };
}

function createListDocuments(documentService, documentRepository) {
  return (req, res) => {
    const documents = documentService.getDocuments(
      req.get('x-owner-id'),
      documentRepository
    );

    res.json(documents);
  };
}

function createDownloadDocument(documentService, documentRepository) {
  return (req, res) => {
    const document = documentService.getDocumentForDownload(
      req.params.id,
      req.get('x-owner-id'),
      documentRepository
    );

    if (!document) {
      res.status(404).json({
        error: {
          code: 'DOCUMENT_NOT_FOUND',
          message: 'Documento não encontrado.',
        },
      });
      return;
    }

    if (!fs.existsSync(document.storagePath)) {
      res.status(404).json({
        error: {
          code: 'FILE_NOT_FOUND',
          message: 'Arquivo do documento não encontrado.',
        },
      });
      return;
    }

    res.download(document.storagePath, document.originalName);
  };
}

module.exports = {
  createDownloadDocument,
  createListDocuments,
  createUploadDocument,
  requireOwner,
};