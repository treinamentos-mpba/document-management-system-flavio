const express = require('express');
const path = require('node:path');
const { createDocumentRepository } = require('./repositories/documentRepository');
const { createFileStorageRepository } = require('./repositories/fileStorageRepository');
const { createDocumentService } = require('./services/documentService');
const { createDocumentsController } = require('./controllers/documentsController');
const { createDocumentsRouter } = require('./routes/documentsRoutes');

const DEFAULT_MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

function createApp(options = {}) {
  const configuredMaxFileSize = Number(process.env.MAX_FILE_SIZE_BYTES);
  const maxFileSizeBytes = options.maxFileSizeBytes ?? (
    Number.isSafeInteger(configuredMaxFileSize) && configuredMaxFileSize > 0
      ? configuredMaxFileSize
      : DEFAULT_MAX_FILE_SIZE_BYTES
  );
  const storageDirectory = options.storageDirectory
    || process.env.STORAGE_DIR
    || path.resolve(__dirname, '../storage');
  const documentRepository = options.documentRepository || createDocumentRepository();
  const fileStorageRepository = createFileStorageRepository({
    storageDirectory,
    maxFileSizeBytes,
  });
  const documentService = createDocumentService({
    documentRepository,
    fileStorageRepository,
  });
  const documentsController = createDocumentsController(documentService);
  const app = express();

  app.use(express.json());
  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });
  app.use(createDocumentsRouter({
    controller: documentsController,
    upload: fileStorageRepository.upload.single('file'),
  }));
  app.use((error, req, res, next) => {
    if (res.headersSent) {
      next(error);
      return;
    }

    if (error.name === 'MulterError') {
      const tooLarge = error.code === 'LIMIT_FILE_SIZE';
      res.status(tooLarge ? 413 : 400).json({
        error: {
          code: tooLarge ? 'FILE_TOO_LARGE' : 'INVALID_UPLOAD',
          message: tooLarge ? 'O arquivo excede o tamanho máximo permitido.' : 'O upload enviado é inválido.',
        },
      });
      return;
    }

    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      error: {
        code: error.code || 'INTERNAL_ERROR',
        message: statusCode === 500 ? 'Ocorreu um erro interno.' : error.message,
      },
    });
  });

  return app;
}

const app = createApp();

if (require.main === module) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`DMS backend ouvindo na porta ${port}`);
  });
}

module.exports = app;
module.exports.createApp = createApp;
