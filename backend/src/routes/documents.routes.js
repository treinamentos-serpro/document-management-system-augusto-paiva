const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');
const express = require('express');
const multer = require('multer');

function createDocumentsRouter(documentsController) {
  const router = express.Router();
  const storageDirectory = path.resolve(__dirname, '../../storage');
  const upload = multer({
    storage: multer.diskStorage({
      destination: (req, file, callback) => {
        fs.mkdir(storageDirectory, { recursive: true }, (error) => {
          callback(error, storageDirectory);
        });
      },
      filename: (req, file, callback) => {
        callback(null, `${randomUUID()}${path.extname(file.originalname)}`);
      },
    }),
    limits: { fileSize: 50 * 1024 * 1024 },
  });

  router.post(
    '/upload',
    documentsController.requireOwner,
    upload.single('file'),
    documentsController.upload
  );
  router.get('/documents', documentsController.requireOwner, documentsController.list);
  router.get(
    '/documents/:id/download',
    documentsController.requireOwner,
    documentsController.download
  );

  return router;
}

module.exports = { createDocumentsRouter };