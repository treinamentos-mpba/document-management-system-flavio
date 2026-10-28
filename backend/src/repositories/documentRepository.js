function createDocumentRepository() {
  const documents = new Map();

  return {
    save(document) {
      documents.set(document.id, document);
      return { ...document };
    },

    listByOwner(owner) {
      return [...documents.values()]
        .filter((document) => document.owner === owner)
        .map((document) => ({ ...document }));
    },

    findById(id) {
      const document = documents.get(id);
      return document ? { ...document } : null;
    },
  };
}

module.exports = { createDocumentRepository };