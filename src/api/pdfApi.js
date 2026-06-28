const BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080';
const API_KEY = import.meta.env.VITE_API_KEY || 'your-key';

function getFilenameFromResponse(response) {
  const disposition = response.headers.get('Content-Disposition');
  if (!disposition) return 'statement.pdf';
  const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
  if (match && match[1]) {
    return match[1].replace(/['"]/g, '');
  }
  return 'statement.pdf';
}

export const generatePdf = async (statement) => {
  const res = await fetch(`${BASE}/pdf`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': API_KEY,
    },
    body: JSON.stringify(statement),
  });
  if (!res.ok) throw new Error('PDF generation failed');
  const blob = await res.blob();
  const filename = getFilenameFromResponse(res);
  return { blob, filename };
};

export const getPdfPreview = async () => {
  const res = await fetch(`${BASE}/pdf/preview`, {
    headers: { 'X-API-KEY': API_KEY },
  });
  if (!res.ok) throw new Error('PDF preview failed');
  return res.blob();
};