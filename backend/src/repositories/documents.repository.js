const documents = [];

function save(document) {
  documents.push(document);
  return document;
}

function findAllByOwner(owner) {
  return documents.filter((document) => document.owner === owner);
}

function findByIdAndOwner(id, owner) {
  return documents.find(
    (document) => document.id === id && document.owner === owner
  );
}

module.exports = {
  findAllByOwner,
  findByIdAndOwner,
  save,
};