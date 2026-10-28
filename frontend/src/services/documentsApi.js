const API_PREFIX = '/api';

async function parseResponse(response) {
  if (response.ok) {
    return response;
  }

  let message = 'Não foi possível concluir a operação.';
  try {
    const body = await response.json();
    message = body.error?.message || message;
  } catch {
    // Respostas sem JSON usam a mensagem padrão.
  }

  throw new Error(message);
}

function userHeaders(owner) {
  return { 'X-User-Id': owner };
}

export async function listDocuments(owner) {
  const response = await parseResponse(await fetch(`${API_PREFIX}/documents`, {
    headers: userHeaders(owner),
  }));
  const body = await response.json();
  return body.documents;
}

export async function uploadDocument(file, owner) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await parseResponse(await fetch(`${API_PREFIX}/upload`, {
    method: 'POST',
    headers: userHeaders(owner),
    body: formData,
  }));
  const body = await response.json();
  return body.document;
}

export async function downloadDocument(document, owner) {
  const response = await parseResponse(await fetch(
    `${API_PREFIX}/documents/${encodeURIComponent(document.id)}/download`,
    { headers: userHeaders(owner) },
  ));
  const fileUrl = URL.createObjectURL(await response.blob());
  const link = globalThis.document.createElement('a');
  link.href = fileUrl;
  link.download = document.originalName;
  link.click();
  globalThis.setTimeout(() => URL.revokeObjectURL(fileUrl), 1000);
}