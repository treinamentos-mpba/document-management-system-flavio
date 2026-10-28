const path = require('node:path');
const { randomUUID } = require('node:crypto');

function createDocumentError(statusCode, code, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
}

function toPublicDocument(document) {
  const { storageName, ...publicDocument } = document;
  return publicDocument;
}

function createDocumentService({ documentRepository, fileStorageRepository }) {
  return {
    async createDocument({ file, owner }) {
      if (!file) {
        throw createDocumentError(400, 'FILE_REQUIRED', 'Envie um arquivo no campo file.');
      }

      const document = {
        id: randomUUID(),
        originalName: path.basename(file.originalname.replace(/\\/g, '/')),
        size: file.size,
        uploadedAt: new Date().toISOString(),
        owner,
        storageName: file.filename,
      };

      try {
        documentRepository.save(document);
      } catch (error) {
        await fileStorageRepository.remove(file.filename);
        throw error;
      }

      return toPublicDocument(document);
    },

    listDocuments(owner) {
      return documentRepository.listByOwner(owner).map(toPublicDocument);
    },

    async getDocumentForDownload(id, owner) {
      const document = documentRepository.findById(id);
      if (!document || document.owner !== owner) {
        throw createDocumentError(404, 'DOCUMENT_NOT_FOUND', 'Documento não encontrado.');
      }

      if (!(await fileStorageRepository.exists(document.storageName))) {
        throw createDocumentError(404, 'DOCUMENT_NOT_FOUND', 'Documento não encontrado.');
      }

      return {
        filePath: fileStorageRepository.getFilePath(document.storageName),
        originalName: document.originalName,
      };
    },
  };
}

module.exports = { createDocumentError, createDocumentService };