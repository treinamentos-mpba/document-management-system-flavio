const fs = require('node:fs');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const multer = require('multer');

function createFileStorageRepository({ storageDirectory, maxFileSizeBytes }) {
  const storage = multer.diskStorage({
    destination(req, file, callback) {
      fs.mkdir(storageDirectory, { recursive: true }, (error) => {
        callback(error, storageDirectory);
      });
    },
    filename(req, file, callback) {
      callback(null, randomUUID());
    },
  });

  return {
    upload: multer({
      storage,
      limits: { fileSize: maxFileSizeBytes },
    }),

    getFilePath(storageName) {
      return path.join(storageDirectory, storageName);
    },

    async exists(storageName) {
      try {
        await fs.promises.access(path.join(storageDirectory, storageName));
        return true;
      } catch (error) {
        if (error.code === 'ENOENT') {
          return false;
        }
        throw error;
      }
    },

    async remove(storageName) {
      try {
        await fs.promises.unlink(path.join(storageDirectory, storageName));
      } catch (error) {
        if (error.code !== 'ENOENT') {
          throw error;
        }
      }
    },
  };
}

module.exports = { createFileStorageRepository };