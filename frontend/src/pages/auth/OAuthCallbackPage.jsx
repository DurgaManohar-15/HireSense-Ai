import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../api/authApi';
import { Sparkles, AlertCircle } from 'lucide-react';

export const OAuthCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { updateUserState } = useAuth();
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const processOAuthCallback = async () => {
      const accessToken = searchParams.get('accessToken') || searchParams.get('token');
      const refreshToken = searchParams.get('refreshToken');
      const error = searchParams.get('error');

      if (error) {
        setErrorMessage(decodeURIComponent(error));
        setTimeout(() => {
          navigate(`/login?error=${encodeURIComponent(error)}`, { replace: true });
        }, 2000);
        return;
      }

      if (!accessToken) {
        setErrorMessage('Authentication response missing access token.');
        setTimeout(() => {
          navigate('/login?error=Authentication+failed', { replace: true });
        }, 2000);
        return;
      }

      try {
        // Save tokens in localStorage
        localStorage.setItem('hiresense_token', accessToken);
        if (refreshToken) {
          localStorage.setItem('hiresense_refresh_token', refreshToken);
        }

        // Fetch user profile
        const res = await authApi.getMe();
        if (res.success && res.data) {
          localStorage.setItem('hiresense_user', JSON.stringify(res.data));
          updateUserState(res.data);

          // Route to appropriate dashboard
          if (res.data.roles?.includes('ROLE_ADMIN')) {
            navigate('/admin/dashboard', { replace: true });
          } else {
            navigate('/dashboard', { replace: true });
          }
        } else {
          navigate('/dashboard', { replace: true });
        }
      } catch (err) {
        console.error('Failed to initialize session after Google OAuth:', err);
        setErrorMessage('Failed to initialize session. Redirecting to login...');
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 2000);
      }
    };

    processOAuthCallback();
  }, [searchParams, navigate, updateUserState]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b0f19] px-4 font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="text-center p-8 bg-[#111827] border border-slate-800 rounded-3xl max-w-sm w-full shadow-2xl">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white shadow-xl shadow-brand-500/25 mb-4 animate-bounce">
          <Sparkles className="w-8 h-8" />
        </div>
        
        {errorMessage ? (
          <div className="space-y-3">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-rose-500/10 text-rose-400">
              <AlertCircle className="w-5 h-5" />
            </div>
            <h3 className="text-white font-bold text-base">Authentication Notice</h3>
            <p className="text-xs text-rose-400">{errorMessage}</p>
          </div>
        ) : (
          <div className="space-y-3">
            <h3 className="text-white font-bold text-base">Authenticating with Google</h3>
            <p className="text-xs text-slate-400">Securing your session &amp; loading placement workspace...</p>
            <div className="flex justify-center pt-2">
              <div className="w-6 h-6 border-3 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OAuthCallbackPage;
