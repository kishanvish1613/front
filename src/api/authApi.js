const BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080';
const API_KEY = import.meta.env.VITE_API_KEY || '4aYi2hk4qN7RP4fm15Z2dKLDpgSsFndP';

export function getStoredToken() {
  return localStorage.getItem('auth_token');
}

export function getAuthHeaders() {
  const token = getStoredToken();
  const headers = {
    'Content-Type': 'application/json',
    'X-API-KEY': API_KEY,
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export async function loginUser(username, password) {
  try {
    const res = await fetch(`${BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || `Authentication failed (${res.status})`);
    }
    return data;
  } catch (err) {
    if (err.message && err.message.includes('Failed to fetch')) {
      throw new Error(`Cannot connect to backend server at ${BASE}. Please verify backend is running on port 8080.`);
    }
    throw err;
  }
}

export async function logoutUser(username) {
  try {
    await fetch(`${BASE}/api/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username }),
    });
  } catch (err) {
    console.warn('Logout request warning:', err);
  }
}

export async function getMe() {
  const token = getStoredToken();
  if (!token) return null;

  try {
    const res = await fetch(`${BASE}/api/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-API-KEY': API_KEY,
      },
    });

    if (!res.ok) {
      throw new Error('Session expired or invalidated');
    }
    return await res.json();
  } catch (err) {
    throw err;
  }
}

// ---------------- Admin Endpoints ----------------

export async function fetchAllUsers() {
  const res = await fetch(`${BASE}/api/admin/users`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to fetch users');
  }
  return res.json();
}

export async function createNormalUser(userData) {
  const res = await fetch(`${BASE}/api/admin/users`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(userData),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to create user');
  }
  return data;
}

export async function toggleUserStatus(userId, enabled) {
  const res = await fetch(`${BASE}/api/admin/users/${userId}/status`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ enabled }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to update user status');
  }
  return data;
}

export async function resetUserDeviceSession(userId) {
  const res = await fetch(`${BASE}/api/admin/users/${userId}/reset-session`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to reset device session');
  }
  return data;
}

export async function deleteUser(userId) {
  const res = await fetch(`${BASE}/api/admin/users/${userId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to delete user');
  }
  return data;
}

export async function fetchAdminSettings() {
  const res = await fetch(`${BASE}/api/admin/settings`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to fetch settings');
  }
  return res.json();
}

export async function toggleStoreUserDataSetting(storeUserDataEnabled) {
  const res = await fetch(`${BASE}/api/admin/settings/toggle-store-data`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ storeUserDataEnabled }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to update storage setting');
  }
  return data;
}

export async function fetchStatementRecords() {
  const res = await fetch(`${BASE}/api/admin/statements`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to fetch statement records');
  }
  return res.json();
}

