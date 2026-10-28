const express = require('express');

function createDocumentsRouter({ controller, upload }) {
  const router = express.Router();

  router.post('/upload', controller.validateOwner, upload, controller.upload);
  router.get('/documents', controller.list);
  router.get('/documents/:id/download', controller.download);

  return router;
}

module.exports = { createDocumentsRouter };