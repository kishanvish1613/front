import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  fetchAllUsers,
  createNormalUser,
  toggleUserStatus,
  resetUserDeviceSession,
  deleteUser,
  fetchAdminSettings,
  toggleStoreUserDataSetting,
  fetchStatementRecords,
} from '../api/authApi';
import {
  Users,
  Shield,
  Database,
  UserPlus,
  ToggleLeft,
  ToggleRight,
  Smartphone,
  Trash2,
  RefreshCw,
  FileText,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
  ExternalLink,
  Code,
  Eye,
  LogOut,
  Layers
} from 'lucide-react';

export default function AdminDashboard({ onOpenStudio }) {
  const { user, logout } = useAuth();

  // State
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'storage' | 'statements'
  const [users, setUsers] = useState([]);
  const [settings, setSettings] = useState({ storeUserDataEnabled: false });
  const [statements, setStatements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // New User Modal State
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newDisplayName, setNewDisplayName] = useState('');
  const [creatingUser, setCreatingUser] = useState(false);

  // JSON Preview Modal State
  const [selectedStatement, setSelectedStatement] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [usersData, settingsData, stmtsData] = await Promise.all([
        fetchAllUsers().catch(() => []),
        fetchAdminSettings().catch(() => ({ storeUserDataEnabled: false })),
        fetchStatementRecords().catch(() => []),
      ]);

      setUsers(usersData);
      setSettings(settingsData);
      setStatements(stmtsData);
    } catch (err) {
      setError(err.message || 'Failed to fetch admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showNotification = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // Handlers
  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError('');
    if (!newUsername.trim() || !newPassword.trim()) {
      setError('Please fill username and password.');
      return;
    }

    setCreatingUser(true);
    try {
      await createNormalUser({
        username: newUsername.trim(),
        password: newPassword.trim(),
        displayName: newDisplayName.trim(),
      });
      setShowAddUserModal(false);
      setNewUsername('');
      setNewPassword('');
      setNewDisplayName('');
      showNotification(`Normal user account '${newUsername}' created successfully!`);
      loadData();
    } catch (err) {
      setError(err.message || 'Failed to create user');
    } finally {
      setCreatingUser(false);
    }
  };

  const handleToggleStatus = async (userId, currentStatus, username) => {
    try {
      await toggleUserStatus(userId, !currentStatus);
      showNotification(`Account '${username}' has been ${!currentStatus ? 'ENABLED' : 'DISABLED'}.`);
      setUsers(users.map(u => u.id === userId ? { ...u, enabled: !currentStatus } : u));
    } catch (err) {
      setError(err.message || 'Failed to update user status');
    }
  };

  const handleResetSession = async (userId, username) => {
    try {
      await resetUserDeviceSession(userId);
      showNotification(`Device session for '${username}' was reset. User can now login on any device.`);
      setUsers(users.map(u => u.id === userId ? { ...u, activeSessionId: null } : u));
    } catch (err) {
      setError(err.message || 'Failed to reset device session');
    }
  };

  const handleDeleteUser = async (userId, username) => {
    if (!window.confirm(`Are you sure you want to permanently delete user '${username}'?`)) return;

    try {
      await deleteUser(userId);
      showNotification(`User '${username}' was deleted.`);
      setUsers(users.filter(u => u.id !== userId));
    } catch (err) {
      setError(err.message || 'Failed to delete user');
    }
  };

  const handleToggleStorage = async () => {
    const nextState = !settings.storeUserDataEnabled;
    try {
      await toggleStoreUserDataSetting(nextState);
      setSettings(prev => ({ ...prev, storeUserDataEnabled: nextState }));
      showNotification(`Normal user data storage has been turned ${nextState ? 'ON' : 'OFF'}.`);
    } catch (err) {
      setError(err.message || 'Failed to toggle storage setting');
    }
  };

  const normalUsersCount = users.filter(u => u.role === 'USER').length;
  const activeUsersCount = users.filter(u => u.role === 'USER' && u.enabled).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/80 px-6 py-3.5 flex items-center justify-between shadow-lg shadow-black/20">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl shadow-md shadow-indigo-500/25 ring-1 ring-white/20">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white">Admin Control Center</h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                RBAC Root
              </span>
            </div>
            <p className="text-xs text-slate-400">Manage normal accounts, single-device sessions & data storage</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenStudio}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-semibold shadow-md shadow-indigo-600/25 transition-all cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Launch Statement Studio</span>
          </button>

          <div className="h-4 w-px bg-slate-800 mx-1" />

          <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-xl">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Admin: <strong className="text-white">{user?.displayName || user?.username}</strong></span>
          </div>

          <button
            onClick={logout}
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">

        {/* Notifications */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError('')} className="text-rose-400 hover:text-white text-xs">Dismiss</button>
          </div>
        )}

        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg('')} className="text-emerald-400 hover:text-white text-xs">Dismiss</button>
          </div>
        )}

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl p-5 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium uppercase tracking-wider">Normal Users</span>
              <Users className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl font-bold text-white">{normalUsersCount}</div>
            <p className="text-xs text-slate-400 mt-1">{activeUsersCount} active / enabled</p>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl p-5 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium uppercase tracking-wider">Data Storage Mode</span>
              <Database className="w-4 h-4 text-purple-400" />
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xl font-bold ${settings.storeUserDataEnabled ? 'text-emerald-400' : 'text-slate-400'}`}>
                {settings.storeUserDataEnabled ? 'ENABLED' : 'DISABLED'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Normal user statement archive</p>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl p-5 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium uppercase tracking-wider">Stored Statements</span>
              <FileText className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-bold text-white">{statements.length}</div>
            <p className="text-xs text-slate-400 mt-1">Archived in MongoDB</p>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl p-5 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium uppercase tracking-wider">Device Security</span>
              <Smartphone className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xl font-bold text-emerald-400">Single Device</div>
            <p className="text-xs text-slate-400 mt-1">Strict concurrent login lock</p>
          </div>
        </div>

        {/* Tabs & Actions Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'users'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-slate-900/70 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>User Accounts ({normalUsersCount})</span>
            </button>

            <button
              onClick={() => setActiveTab('storage')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'storage'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-slate-900/70 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>Data Storage Control</span>
            </button>

            <button
              onClick={() => setActiveTab('statements')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'statements'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-slate-900/70 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Stored Statement Records ({statements.length})</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              disabled={loading}
              className="p-2 text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800 rounded-xl transition-colors cursor-pointer"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            {activeTab === 'users' && (
              <button
                onClick={() => setShowAddUserModal(true)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 transition-all cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Create Normal User</span>
              </button>
            )}
          </div>
        </div>

        {/* TAB 1: USER MANAGEMENT */}
        {activeTab === 'users' && (
          <div className="bg-slate-900/70 backdrop-blur-md border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white">Registered User Accounts</h2>
                <p className="text-xs text-slate-400 mt-0.5">Control account status, passwords, and active device sessions</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-3.5">User</th>
                    <th className="px-6 py-3.5">Role</th>
                    <th className="px-6 py-3.5">Account Status</th>
                    <th className="px-6 py-3.5">Device Session</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {users.map((u) => {
                    const isNormalUser = u.role === 'USER';
                    const hasActiveSession = !!u.activeSessionId;

                    return (
                      <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                              u.role === 'ADMIN' ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40' : 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40'
                            }`}>
                              {u.username.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-semibold text-white">{u.displayName || u.username}</div>
                              <div className="text-[11px] text-slate-400 font-mono">@{u.username}</div>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${
                            u.role === 'ADMIN'
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                              : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                          }`}>
                            {u.role === 'ADMIN' ? 'Administrator' : 'Normal User'}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          {isNormalUser ? (
                            <button
                              onClick={() => handleToggleStatus(u.id, u.enabled, u.username)}
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                                u.enabled
                                  ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20'
                                  : 'bg-rose-500/10 text-rose-300 border border-rose-500/30 hover:bg-rose-500/20'
                              }`}
                            >
                              {u.enabled ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                              <span>{u.enabled ? 'Enabled (Can Login)' : 'Disabled (Blocked)'}</span>
                            </button>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-emerald-400 text-xs">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Always Enabled
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-4">
                          {isNormalUser ? (
                            <div className="flex items-center gap-2">
                              {hasActiveSession ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] bg-amber-500/15 text-amber-300 border border-amber-500/30 font-medium">
                                  <Smartphone className="w-3 h-3 text-amber-400" />
                                  Active Device
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 text-slate-500 text-[11px]">
                                  No Active Session
                                </span>
                              )}

                              {hasActiveSession && (
                                <button
                                  onClick={() => handleResetSession(u.id, u.username)}
                                  className="text-[11px] px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded border border-slate-700 transition-colors cursor-pointer"
                                  title="Clear active device session so user can log in elsewhere"
                                >
                                  Reset Session
                                </button>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-500 text-[11px]">Multi-session</span>
                          )}
                        </td>

                        <td className="px-6 py-4 text-right">
                          {isNormalUser && (
                            <button
                              onClick={() => handleDeleteUser(u.id, u.username)}
                              className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                              title="Delete User"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: DATA STORAGE CONTROL */}
        {activeTab === 'storage' && (
          <div className="space-y-6">
            <div className="bg-slate-900/70 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 shadow-xl">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Database className="w-5 h-5 text-indigo-400" />
                    <h2 className="text-base font-bold text-white">Store Normal User Processed Data</h2>
                  </div>
                  <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
                    When enabled, any bank statement PDF created or processed by normal users will be automatically saved to MongoDB Atlas (`statement_records`).
                    Admins can audit transaction amounts, customer names, accounts, and raw JSON payloads.
                  </p>
                </div>

                <button
                  onClick={handleToggleStorage}
                  className={`flex items-center gap-3 px-5 py-3 rounded-2xl font-bold text-sm transition-all cursor-pointer shadow-lg ${
                    settings.storeUserDataEnabled
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                  }`}
                >
                  {settings.storeUserDataEnabled ? (
                    <>
                      <ToggleRight className="w-6 h-6 text-white" />
                      <span>Data Storage is ON</span>
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="w-6 h-6 text-slate-400" />
                      <span>Data Storage is OFF</span>
                    </>
                  )}
                </button>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>Database Cluster: <strong className="text-slate-300 font-mono">cluster0.ywx22ne.mongodb.net/statement_db</strong></span>
                <span>Last Updated: <strong className="text-slate-300">{settings.updatedAt ? new Date(settings.updatedAt).toLocaleString() : 'N/A'}</strong></span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: STORED STATEMENT RECORDS */}
        {activeTab === 'statements' && (
          <div className="bg-slate-900/70 backdrop-blur-md border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white">Archived Statement Records</h2>
                <p className="text-xs text-slate-400 mt-0.5">Historical statement audits processed while data storage was active</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {statements.length} Total Records
              </span>
            </div>

            {statements.length === 0 ? (
              <div className="p-12 text-center text-slate-400 space-y-2">
                <FileText className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-sm font-medium">No statement records stored yet.</p>
                <p className="text-xs text-slate-400">Make sure 'Store Normal User Processed Data' is enabled in the storage tab when normal users generate statements.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                    <tr>
                      <th className="px-6 py-3.5">Generated At</th>
                      <th className="px-6 py-3.5">User</th>
                      <th className="px-6 py-3.5">Template / Bank</th>
                      <th className="px-6 py-3.5">Customer & Account</th>
                      <th className="px-6 py-3.5">Balances & Txns</th>
                      <th className="px-6 py-3.5 text-right">View Data</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {statements.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4 text-slate-300 whitespace-nowrap">
                          {s.generatedAt ? new Date(s.generatedAt).toLocaleString() : 'N/A'}
                        </td>

                        <td className="px-6 py-4">
                          <span className="font-semibold text-white">@{s.username}</span>
                        </td>

                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-indigo-300 border border-slate-700">
                            {s.bankTemplate}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <div className="font-medium text-white">{s.customerName || 'N/A'}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{s.accountNumber || 'N/A'}</div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="text-slate-300">
                            Start: <strong className="text-white">₹{s.openingBalance?.toFixed(2)}</strong> | End: <strong className="text-white">₹{s.closingBalance?.toFixed(2)}</strong>
                          </div>
                          <div className="text-[11px] text-slate-400">{s.totalTransactions} transactions</div>
                        </td>

                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => setSelectedStatement(s)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 rounded-lg border border-indigo-500/30 transition-colors cursor-pointer text-xs"
                          >
                            <Code className="w-3.5 h-3.5" />
                            <span>Payload</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </main>

      {/* CREATE USER MODAL */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">Create Normal User Account</h3>
              </div>
              <button
                onClick={() => setShowAddUserModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Username (Login ID)</label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="e.g. jdoe"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Full Name / Display Name</label>
                <input
                  type="text"
                  value={newDisplayName}
                  onChange={(e) => setNewDisplayName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Initial user password"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="p-3 bg-indigo-950/30 border border-indigo-900/40 rounded-xl text-[11px] text-indigo-300/80 flex items-start gap-2">
                <Smartphone className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <span>Normal user accounts are automatically governed by Single-Device login enforcement.</span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingUser}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50"
                >
                  {creatingUser ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* JSON STATEMENT VIEWER MODAL */}
      {selectedStatement && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Stored Statement Payload</h3>
                <p className="text-xs text-slate-400">@{selectedStatement.username} • {selectedStatement.bankTemplate} • {selectedStatement.customerName}</p>
              </div>
              <button
                onClick={() => setSelectedStatement(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-auto bg-slate-950 rounded-xl p-4 border border-slate-800">
              <pre className="text-xs font-mono text-indigo-300 leading-relaxed">
                {selectedStatement.statementJson
                  ? JSON.stringify(JSON.parse(selectedStatement.statementJson), null, 2)
                  : 'No raw payload available'}
              </pre>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedStatement(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

