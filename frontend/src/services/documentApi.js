const API_BASE_URL = '/api';

function createHeaders(owner) {
  return { 'x-owner-id': owner };
}

async function parseResponse(response) {
  if (response.ok) {
    return response;
  }

  const body = await response.json().catch(() => null);
  throw new Error(body?.error?.message || 'Não foi possível concluir a operação.');
}

export async function uploadDocument(file, owner) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: 'POST',
    headers: createHeaders(owner),
    body: formData,
  });

  await parseResponse(response);
  return response.json();
}

export async function listDocuments(owner) {
  const response = await fetch(`${API_BASE_URL}/documents`, {
    headers: createHeaders(owner),
  });

  await parseResponse(response);
  return response.json();
}

export async function downloadDocument(id, owner) {
  const response = await fetch(`${API_BASE_URL}/documents/${id}/download`, {
    headers: createHeaders(owner),
  });

  await parseResponse(response);
  return response.blob();
}