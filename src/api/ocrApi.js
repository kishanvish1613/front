import { getStoredToken } from './authApi';

const BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080';
const API_KEY = import.meta.env.VITE_API_KEY || '4aYi2hk4qN7RP4fm15Z2dKLDpgSsFndP';

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

async function fetchJson(url, options = {}) {
  const headers = getRequestHeaders(options.headers);
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
  
  const headers = { 'X-API-KEY': API_KEY };
  const token = getStoredToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE}/ocr`, {
    method: 'POST',
    headers,
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'OCR failed');
  return data;
};

export const getOcrPreview = () =>
  fetchJson('/ocr/preview');