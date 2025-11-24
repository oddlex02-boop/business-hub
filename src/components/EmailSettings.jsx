// components/EmailSettings.jsx
import { useState, useEffect } from 'react';
import { saveUserEmailConfig, getUserEmailConfig } from '@/lib/firebase';
import { testUserEmailService } from '@/utils/userEmailService';

export default function EmailSettings({ user }) {
  const [emailConfig, setEmailConfig] = useState({
    preferredProvider: 'resend',
    resendApiKey: '',
    brevoApiKey: '',
    resendLimit: 10000,
    brevoLimit: 300,
    isActive: true
  });
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    loadUserConfig();
  }, [user]);

  const loadUserConfig = async () => {
    if (user) {
      const config = await getUserEmailConfig(user.uid);
      if (config) {
        setEmailConfig(config);
      }
    }
  };

  const testEmailSettings = async () => {
    setTesting(true);
    const result = await testUserEmailService(user.uid);
    if (result.success) {
      alert(`✅ Email settings working! Sent via ${result.provider}`);
    } else {
      alert(`❌ Email configuration failed: ${result.message}`);
    }
    setTesting(false);
  };

  const saveEmailSettings = async () => {
    setLoading(true);
    try {
      await saveUserEmailConfig(user.uid, emailConfig);
      alert('✅ Email settings saved successfully!');
    } catch (error) {
      alert('❌ Failed to save email settings');
    }
    setLoading(false);
  };

  return (
    <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
        ⚙️ Email Settings
      </h2>

      <div className="space-y-6">
        {/* Preferred Provider */}
        <div>
          <label className="block text-sm font-medium mb-2">Preferred Email Provider</label>
          <select
            value={emailConfig.preferredProvider}
            onChange={(e) => setEmailConfig({...emailConfig, preferredProvider: e.target.value})}
            className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:border-purple-500"
          >
            <option value="resend">Resend.com (Recommended)</option>
            <option value="brevo">Brevo.com</option>
          </select>
        </div>

        {/* Resend Settings */}
        <div className="p-4 bg-white/5 rounded-lg">
          <h3 className="font-semibold mb-3 text-purple-400">Resend.com Settings</h3>
          <input
            placeholder="Resend API Key"
            value={emailConfig.resendApiKey}
            onChange={(e) => setEmailConfig({...emailConfig, resendApiKey: e.target.value})}
            className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:border-purple-500 mb-2"
          />
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">Daily Limit:</span>
            <input
              type="number"
              value={emailConfig.resendLimit}
              onChange={(e) => setEmailConfig({...emailConfig, resendLimit: parseInt(e.target.value)})}
              className="w-24 px-3 py-1 rounded bg-white/10 border border-white/20"
            />
          </div>
        </div>

        {/* Brevo Settings */}
        <div className="p-4 bg-white/5 rounded-lg">
          <h3 className="font-semibold mb-3 text-blue-400">Brevo.com Settings</h3>
          <input
            placeholder="Brevo API Key"
            value={emailConfig.brevoApiKey}
            onChange={(e) => setEmailConfig({...emailConfig, brevoApiKey: e.target.value})}
            className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:border-purple-500 mb-2"
          />
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">Daily Limit:</span>
            <input
              type="number"
              value={emailConfig.brevoLimit}
              onChange={(e) => setEmailConfig({...emailConfig, brevoLimit: parseInt(e.target.value)})}
              className="w-24 px-3 py-1 rounded bg-white/10 border border-white/20"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={testEmailSettings}
            disabled={testing}
            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg flex items-center gap-2 disabled:opacity-50"
          >
            {testing ? 'Testing...' : '🧪 Test Settings'}
          </button>
          <button
            onClick={saveEmailSettings}
            disabled={loading}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Saving...' : '💾 Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}