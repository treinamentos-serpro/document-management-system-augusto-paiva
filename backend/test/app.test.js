const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const app = require('../src/app');

async function request(path, options) {
  const server = app.listen(0);

  await new Promise((resolve) => server.once('listening', resolve));
  const { port } = server.address();

  try {
    return await fetch(`http://127.0.0.1:${port}${path}`, options);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
}

// Teste de fumaça do seed: garante que o app Express foi exportado.
// Novos testes serão adicionados durante os Steps 2, 6 e 7 com auxílio do Copilot.
test('o app backend é exportado', () => {
  assert.ok(app, 'o app deve estar definido');
  assert.strictEqual(typeof app, 'function', 'o app Express deve ser uma função');
});

test('rejeita upload sem arquivo', async () => {
  const response = await request('/upload', {
    method: 'POST',
    headers: { 'x-owner-id': 'user-123' },
  });

  assert.strictEqual(response.status, 400);
  assert.deepStrictEqual(await response.json(), {
    error: {
      code: 'FILE_REQUIRED',
      message: 'Envie um arquivo no campo file.',
    },
  });
});

test('envia, lista e baixa um documento do proprietário', async () => {
  const fileName = `nota-${Date.now()}.txt`;
  const storageDirectory = path.resolve(__dirname, '../storage');
  const existingFiles = new Set(fs.readdirSync(storageDirectory));
  const formData = new FormData();
  formData.append(
    'file',
    new Blob(['conteúdo do documento'], { type: 'text/plain' }),
    fileName
  );

  const uploadResponse = await request('/upload', {
    method: 'POST',
    headers: { 'x-owner-id': 'user-456' },
    body: formData,
  });

  assert.strictEqual(uploadResponse.status, 201);
  const document = await uploadResponse.json();
  assert.match(document.id, /^[0-9a-f-]{36}$/);
  assert.deepStrictEqual(
    {
      originalName: document.originalName,
      size: document.size,
      owner: document.owner,
    },
    { originalName: fileName, size: 22, owner: 'user-456' }
  );
  assert.ok(Date.parse(document.uploadedAt));

  const listResponse = await request('/documents', {
    headers: { 'x-owner-id': 'user-456' },
  });
  assert.strictEqual(listResponse.status, 200);
  assert.deepStrictEqual(await listResponse.json(), [document]);

  const downloadResponse = await request(`/documents/${document.id}/download`, {
    headers: { 'x-owner-id': 'user-456' },
  });
  assert.strictEqual(downloadResponse.status, 200);
  assert.match(
    downloadResponse.headers.get('content-disposition'),
    new RegExp(`attachment; filename="${fileName}"`)
  );
  assert.strictEqual(await downloadResponse.text(), 'conteúdo do documento');

  const storedFile = fs
    .readdirSync(storageDirectory)
    .find((name) => !existingFiles.has(name));
  fs.unlinkSync(path.join(storageDirectory, storedFile));
});
