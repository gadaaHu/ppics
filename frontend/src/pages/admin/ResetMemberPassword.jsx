import React, { useState } from 'react';
import { resetMemberPassword } from '../../api/authApi';
import { Key, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';

const ResetMemberPassword = ({ memberId, memberName, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [message, setMessage] = useState(null);

  const handleReset = async () => {
    setLoading(true);
    setMessage(null);
    
    try {
      const response = await resetMemberPassword(memberId);
      if (response.success) {
        setMessage({
          type: 'success',
          text: `Password reset to default: ICS@123`
        });
        setShowConfirm(false);
        if (onSuccess) onSuccess();
      } else {
        setMessage({
          type: 'error',
          text: response.message || 'Failed to reset password'
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'An error occurred while resetting password'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      {!showConfirm ? (
        <button
          onClick={() => setShowConfirm(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-yellow-700 bg-yellow-50 border border-yellow-300 rounded-lg hover:bg-yellow-100 transition-colors"
        >
          <Key className="w-4 h-4" />
          Reset Password
        </button>
      ) : (
        <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 space-y-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-gray-700">
                Reset password for <strong>{memberName}</strong>?
              </p>
              <p className="text-xs text-gray-500 mt-1">
                The password will be set to: <span className="font-mono font-bold">ICS@123</span>
              </p>
            </div>
          </div>
          
          {message && (
            <div className={`flex items-center gap-2 p-2 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {message.type === 'success' ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              <span className="text-sm">{message.text}</span>
            </div>
          )}
          
          <div className="flex gap-2">
            <button
              onClick={handleReset}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-yellow-600 rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Key className="w-4 h-4" />
              )}
              Confirm Reset
            </button>
            <button
              onClick={() => {
                setShowConfirm(false);
                setMessage(null);
              }}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResetMemberPassword;