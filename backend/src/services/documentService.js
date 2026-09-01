const { randomUUID } = require('crypto');

function createDocument(file, owner, documentRepository) {
  const document = {
    id: randomUUID(),
    originalName: file.originalname,
    size: file.size,
    uploadedAt: new Date().toISOString(),
    owner,
    storageName: file.filename,
    storagePath: file.path,
  };

  documentRepository.save(document);
  return document;
}

function getDocuments(owner, documentRepository) {
  return documentRepository.findAllByOwner(owner).map(toMetadata);
}

function getDocumentForDownload(id, owner, documentRepository) {
  return documentRepository.findByIdAndOwner(id, owner);
}

function toMetadata(document) {
  const { storageName, storagePath, ...metadata } = document;
  return metadata;
}

module.exports = {
  createDocument,
  getDocumentForDownload,
  getDocuments,
  toMetadata,
};