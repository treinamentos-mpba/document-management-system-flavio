const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { once } = require('node:events');
const app = require('../src/app');
const { createApp } = require('../src/app');

test('o app backend é exportado', () => {
  assert.ok(app, 'o app deve estar definido');
  assert.strictEqual(typeof app, 'function', 'o app Express deve ser uma função');
});

async function startTestServer(options = {}) {
  const storageDirectory = await fs.mkdtemp(path.join(os.tmpdir(), 'dms-test-'));
  const server = createApp({ storageDirectory, ...options }).listen(0);
  await once(server, 'listening');

  return {
    baseUrl: `http://127.0.0.1:${server.address().port}`,
    storageDirectory,
    close: async () => {
      await new Promise((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      });
      await fs.rm(storageDirectory, { recursive: true, force: true });
    },
  };
}

function uploadBody(name, content) {
  const form = new FormData();
  form.append('file', new Blob([content], { type: 'text/plain' }), name);
  return form;
}

test('health responde com status ok', async (context) => {
  const server = await startTestServer();
  context.after(server.close);

  const response = await fetch(`${server.baseUrl}/health`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: 'ok' });
});

test('envia arquivo e lista metadados sem expor o nome interno', async (context) => {
  const server = await startTestServer();
  context.after(server.close);

  const response = await fetch(`${server.baseUrl}/upload`, {
    method: 'POST',
    headers: { 'X-User-Id': 'ana' },
    body: uploadBody('relatorio.txt', 'conteudo do documento'),
  });
  const { document } = await response.json();

  assert.equal(response.status, 201);
  assert.equal(document.originalName, 'relatorio.txt');
  assert.equal(document.size, Buffer.byteLength('conteudo do documento'));
  assert.equal(document.owner, 'ana');
  assert.ok(document.id);
  assert.ok(document.uploadedAt);
  assert.equal(Object.hasOwn(document, 'storageName'), false);

  const listResponse = await fetch(`${server.baseUrl}/documents`, {
    headers: { 'X-User-Id': 'ana' },
  });
  assert.deepEqual(await listResponse.json(), { documents: [document] });
});

test('download entrega o arquivo e impede acesso por outro usuário', async (context) => {
  const server = await startTestServer();
  context.after(server.close);

  const uploadResponse = await fetch(`${server.baseUrl}/upload`, {
    method: 'POST',
    headers: { 'X-User-Id': 'ana' },
    body: uploadBody('nota.txt', 'texto local'),
  });
  const { document } = await uploadResponse.json();

  const downloadResponse = await fetch(`${server.baseUrl}/documents/${document.id}/download`, {
    headers: { 'X-User-Id': 'ana' },
  });
  assert.equal(downloadResponse.status, 200);
  assert.equal(await downloadResponse.text(), 'texto local');
  assert.match(downloadResponse.headers.get('content-disposition'), /nota\.txt/);

  const otherUserResponse = await fetch(`${server.baseUrl}/documents/${document.id}/download`, {
    headers: { 'X-User-Id': 'bia' },
  });
  assert.equal(otherUserResponse.status, 404);
  assert.deepEqual(await otherUserResponse.json(), {
    error: { code: 'DOCUMENT_NOT_FOUND', message: 'Documento não encontrado.' },
  });
});

test('rejeita upload sem arquivo e arquivo acima do limite', async (context) => {
  const server = await startTestServer({ maxFileSizeBytes: 3 });
  context.after(server.close);

  const missingFile = await fetch(`${server.baseUrl}/upload`, { method: 'POST' });
  assert.equal(missingFile.status, 400);
  assert.equal((await missingFile.json()).error.code, 'FILE_REQUIRED');

  const oversizedFile = await fetch(`${server.baseUrl}/upload`, {
    method: 'POST',
    body: uploadBody('grande.txt', 'quatro'),
  });
  assert.equal(oversizedFile.status, 413);
  assert.equal((await oversizedFile.json()).error.code, 'FILE_TOO_LARGE');
});

test('valida o usuário antes de persistir o arquivo', async (context) => {
  const server = await startTestServer();
  context.after(server.close);

  const response = await fetch(`${server.baseUrl}/upload`, {
    method: 'POST',
    headers: { 'X-User-Id': '   ' },
    body: uploadBody('arquivo.txt', 'conteudo'),
  });

  assert.equal(response.status, 400);
  assert.equal((await response.json()).error.code, 'INVALID_OWNER');
  assert.deepEqual(await fs.readdir(server.storageDirectory), []);
});
