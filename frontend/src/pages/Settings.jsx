import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/Layouts/DashboardLayout';
import { authAPI } from '../services/api';

// Lightweight Toast
const Toast = ({ type = 'success', message, onClose }) => {
  if (!message) return null;
  const base = 'fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg text-sm font-medium flex items-center gap-2';
  const styles = type === 'error' ? 'bg-red-600 text-white' : 'bg-green-600 text-white';
  return (
    <div className={`${base} ${styles}`}>
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 text-white/90 hover:text-white">✕</button>
    </div>
  );
};

// Simple modal
const Modal = ({ open, onClose, children, title }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-lg max-h-[85vh] overflow-auto bg-white rounded-2xl shadow-lg p-6">
        {title && <h3 className="text-lg font-semibold mb-4 text-gray-900">{title}</h3>}
        {children}
      </div>
    </div>
  );
};



export default function Settings() {
  // User state for password change
  const [user, setUser] = useState(null);

  // Theme state (fix missing theme definition)
  const [theme, setTheme] = useState('system');

  // Preferences (local only)
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifInApp, setNotifInApp] = useState(true);
  const [notifPush, setNotifPush] = useState(false);

  // Security
  const [pwdOpen, setPwdOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Toasts
  const [toast, setToast] = useState({ type: 'success', message: '' });
  const showToast = (type, message) => setToast({ type, message });

  // Load from API + local storage
  useEffect(() => {
    const load = async () => {
      try {
        const u = await authAPI.getUserProfile();
        setUser(u);
      } catch (e) {
        console.error('Failed to load user', e);
        showToast('error', 'Failed to load user.');
      }

      // Local prefs
      try {
        const prefs = JSON.parse(localStorage.getItem('settings.prefs') || '{}');
        if (prefs.theme) setTheme(prefs.theme);
        if (typeof prefs.notifEmail === 'boolean') setNotifEmail(prefs.notifEmail);
        if (typeof prefs.notifInApp === 'boolean') setNotifInApp(prefs.notifInApp);
        if (typeof prefs.notifPush === 'boolean') setNotifPush(prefs.notifPush);
      } catch {}
    };
    load();
  }, []);

  // Persist preferences locally whenever they change
  useEffect(() => {
    const prefs = { theme, notifEmail, notifInApp, notifPush };
    localStorage.setItem('settings.prefs', JSON.stringify(prefs));
  }, [theme, notifEmail, notifInApp, notifPush]);

  // Apply theme and sync with system preference if needed
  useEffect(() => {
    // Define applyTheme function here to fix ReferenceError
    const applyTheme = (theme) => {
      const root = window.document.documentElement;
      const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    applyTheme(theme);

    let mql;
    const handler = () => applyTheme('system');

    if (theme === 'system' && window.matchMedia) {
      mql = window.matchMedia('(prefers-color-scheme: dark)');
      // Modern API
      if (mql.addEventListener) mql.addEventListener('change', handler);
      // Safari fallback
      else if (mql.addListener) mql.addListener(handler);
    }

    return () => {
      if (mql) {
        if (mql.removeEventListener) mql.removeEventListener('change', handler);
        else if (mql.removeListener) mql.removeListener(handler);
      }
    };
  }, [theme]);

  const handleChangePassword = async (e) => {
    e?.preventDefault?.();
    if (!newPassword || !confirmPassword) {
      showToast('error', 'Please fill both password fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('error', 'Passwords do not match.');
      return;
    }
    try {
      // Backend supports direct reset via forgotPassword with username/new_password
      await authAPI.forgotPassword({
        username: user?.username,
        email: user?.email,
        frontend_base: window.location.origin,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      showToast('success', 'Password updated successfully.');
      setPwdOpen(false);
      setNewPassword('');
      setConfirmPassword('');
    } catch (e) {
      console.error('Password change failed', e);
      showToast('error', 'Failed to change password.');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <Toast type={toast.type} message={toast.message} onClose={() => setToast({ type: 'success', message: '' })} />

        {/* Page Header - matches Staff Management style */}
        <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="p-8">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                {/* Cog Icon */}
                <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 8.5a3.5 3.5 0 100 7 3.5 3.5 0 000-7z" />
                  <path fillRule="evenodd" d="M10.325 1.858c.4-1.054 1.95-1.054 2.35 0l.38.999c.15.394.52.665.94.703l1.066.097c1.122.102 1.58 1.5.78 2.274l-.772.738c-.307.294-.43.73-.317 1.14l.278 1.027c.296 1.09.1 1.49-.64 2.213l-.79.78c-.3.296-.433.73-.35 1.14l.215 1.04c.24 1.158-.824 2.12-1.95 1.73l-1.02-.34a1.25 1.25 0 00-.78 0l-1.02.34c-1.126.39-2.19-.572-1.95-1.73l.215-1.04c.083-.41-.05-.844-.35-1.14l-.79-.78c-.74-.723-.936-1.123-.64-2.214l.279-1.026a1.25 1.25 0 00-.317-1.14l-.772-.738c-.8-.774-.342-2.172.78-2.274l1.066-.097c.42-.038.79-.309.94-.703l.38-.999z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
                <p className="text-blue-100 text-lg">Manage your profile, preferences, and security</p>
                <div className="flex items-center gap-3 mt-3">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white/20 text-white">User</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Preferences Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Preferences</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Theme</h3>
                <div className="flex items-center gap-3">
                  <label className="inline-flex items-center gap-2">
                    <input type="radio" name="theme" checked={theme === 'system'} onChange={() => setTheme('system')} className="accent-blue-600" />
                    <span className="text-gray-700">System</span>
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input type="radio" name="theme" checked={theme === 'light'} onChange={() => setTheme('light')} className="accent-blue-600" />
                    <span className="text-gray-700">Light</span>
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input type="radio" name="theme" checked={theme === 'dark'} onChange={() => setTheme('dark')} className="accent-blue-600" />
                    <span className="text-gray-700">Dark</span>
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-1">Your choice is saved locally and applied across the app.</p>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notifications</h3>
                <div className="space-y-2">
                  <label className="flex items-center justify-between">
                    <span className="text-gray-700 dark:text-gray-300">Email updates</span>
                    <input type="checkbox" className="accent-blue-600 h-5 w-5" checked={notifEmail} onChange={(e) => setNotifEmail(e.target.checked)} />
                  </label>
                  <label className="flex items-center justify-between">
                    <span className="text-gray-700 dark:text-gray-300">In-app alerts</span>
                    <input type="checkbox" className="accent-blue-600 h-5 w-5" checked={notifInApp} onChange={(e) => setNotifInApp(e.target.checked)} />
                  </label>
                  <label className="flex items-center justify-between">
                    <span className="text-gray-700 dark:text-gray-300">Push notifications</span>
                    <input type="checkbox" className="accent-blue-600 h-5 w-5" checked={notifPush} onChange={(e) => setNotifPush(e.target.checked)} />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Security Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Security</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-1">Password</h3>
                <p className="text-sm text-gray-600 mb-3">It’s a good idea to use a strong password that you don’t use elsewhere.</p>
                <button type="button" onClick={() => setPwdOpen(true)} className="px-4 py-2 rounded-xl bg-gray-900 text-white hover:bg-black">Change Password</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      <Modal open={pwdOpen} onClose={() => setPwdOpen(false)} title="Change Password">
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all"
              required
              minLength={6}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all"
              required
              minLength={6}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setPwdOpen(false)} className="px-4 py-2 rounded-xl border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700">Update Password</button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}