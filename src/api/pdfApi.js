import { getStoredToken } from './authApi';

const BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080';
const API_KEY = import.meta.env.VITE_API_KEY || '4aYi2hk4qN7RP4fm15Z2dKLDpgSsFndP';

function getFilenameFromResponse(response) {
  const disposition = response.headers.get('Content-Disposition');
  if (!disposition) return 'statement.pdf';
  const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
  if (match && match[1]) {
    return match[1].replace(/['"]/g, '');
  }
  return 'statement.pdf';
}

function getRequestHeaders(additional = {}) {
  const headers = {
    'X-API-KEY': API_KEY,
    ...additional,
  };
  const token = getStoredToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const generatePdf = async (statement) => {
  const res = await fetch(`${BASE}/pdf`, {
    method: 'POST',
    headers: getRequestHeaders({
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify(statement),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(errText || 'PDF generation failed');
  }

  const blob = await res.blob();
  const filename = getFilenameFromResponse(res);
  return { blob, filename };
};

export const getPdfPreview = async () => {
  const res = await fetch(`${BASE}/pdf/preview`, {
    headers: getRequestHeaders(),
  });
  if (!res.ok) throw new Error('PDF preview failed');
  return res.blob();
};