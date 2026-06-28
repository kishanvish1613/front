const BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080';
const API_KEY = import.meta.env.VITE_API_KEY || 'your-key';

async function fetchJson(url, options = {}) {
  const headers = {
    'X-API-KEY': API_KEY,
    ...options.headers,
  };
  const res = await fetch(`${BASE}${url}`, { ...options, headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OCR request failed: ${res.status} ${text}`);
  }
  return res.json();
}

export const uploadOcr = async (file, password) => {
  const formData = new FormData();
  formData.append('file', file);
  if (password) formData.append('password', password);
  const res = await fetch(`${BASE}/ocr`, {
    method: 'POST',
    headers: { 'X-API-KEY': API_KEY },
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'OCR failed');
  return data;
};

export const getOcrPreview = () =>
  fetchJson('/ocr/preview');