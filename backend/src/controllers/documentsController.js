const { createDocumentError } = require('../services/documentService');

function getOwner(req) {
  const providedOwner = req.get('X-User-Id');
  const owner = providedOwner === undefined ? 'default' : providedOwner.trim();
  if (!owner || owner.length > 100) {
    throw createDocumentError(400, 'INVALID_OWNER', 'O identificador do usuário deve ter de 1 a 100 caracteres.');
  }
  return owner;
}

function createDocumentsController(documentService) {
  return {
    validateOwner(req, res, next) {
      try {
        getOwner(req);
        next();
      } catch (error) {
        next(error);
      }
    },

    async upload(req, res, next) {
      try {
        const document = await documentService.createDocument({
          file: req.file,
          owner: getOwner(req),
        });
        res.status(201).json({ document });
      } catch (error) {
        next(error);
      }
    },

    list(req, res, next) {
      try {
        res.json({ documents: documentService.listDocuments(getOwner(req)) });
      } catch (error) {
        next(error);
      }
    },

    async download(req, res, next) {
      try {
        const document = await documentService.getDocumentForDownload(req.params.id, getOwner(req));
        res.download(document.filePath, document.originalName, (error) => {
          if (error) {
            next(error);
          }
        });
      } catch (error) {
        next(error);
      }
    },
  };
}

module.exports = { createDocumentsController };