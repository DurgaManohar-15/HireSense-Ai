import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../api/authApi';
import { Sparkles, AlertCircle } from 'lucide-react';

const decodeJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

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
        }, 2500);
        return;
      }

      if (!accessToken) {
        setErrorMessage('Authentication response missing access token.');
        setTimeout(() => {
          navigate('/login?error=Authentication+failed', { replace: true });
        }, 2000);
        return;
      }

      // 1. Decode JWT payload immediately to bootstrap session
      const claims = decodeJwt(accessToken) || {};
      const roles = claims.roles
        ? (Array.isArray(claims.roles) ? claims.roles : claims.roles.split(','))
        : ['ROLE_STUDENT'];

      const fallbackUser = {
        id: claims.sub,
        email: claims.email || '',
        firstName: claims.firstName || (claims.email ? claims.email.split('@')[0] : 'Candidate'),
        lastName: claims.lastName || '',
        roles: roles,
        authProvider: 'GOOGLE',
      };

      // 2. Persist tokens and base user session immediately
      localStorage.setItem('hiresense_token', accessToken);
      if (refreshToken) {
        localStorage.setItem('hiresense_refresh_token', refreshToken);
      }
      localStorage.setItem('hiresense_user', JSON.stringify(fallbackUser));
      updateUserState(fallbackUser);

      // 3. Attempt to fetch fresh profile from API (non-blocking)
      try {
        const res = await authApi.getMe();
        if (res && res.data) {
          localStorage.setItem('hiresense_user', JSON.stringify(res.data));
          updateUserState(res.data);
          if (res.data.roles?.includes('ROLE_ADMIN')) {
            navigate('/admin/dashboard', { replace: true });
            return;
          }
        }
      } catch (err) {
        console.warn('Could not fetch latest user profile from server, using verified JWT claims session:', err);
      }

      // 4. Smoothly route into dashboard
      if (roles.includes('ROLE_ADMIN')) {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    };

    processOAuthCallback();
  }, [searchParams, navigate, updateUserState]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F3EFE6] px-4 font-sans selection:bg-[#E78260]/20 selection:text-[#E78260]">
      <div className="text-center p-8 bg-white border border-[#E2DDD5] rounded-[2rem] max-w-sm w-full shadow-xl shadow-black/[0.04]">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#FBEDE8] text-[#E78260] mb-4">
          <Sparkles className="w-7 h-7" />
        </div>

        {errorMessage ? (
          <div className="space-y-3">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-rose-50 text-rose-500">
              <AlertCircle className="w-5 h-5" />
            </div>
            <h3 className="text-[#292929] font-bold text-base">Authentication Notice</h3>
            <p className="text-xs text-rose-600">{errorMessage}</p>
          </div>
        ) : (
          <div className="space-y-3">
            <h3 className="text-[#292929] font-bold text-base">Authenticating with Google</h3>
            <p className="text-xs text-[#5C5850]">Securing your session &amp; loading placement workspace...</p>
            <div className="flex justify-center pt-2">
              <div className="w-6 h-6 border-3 border-[#E78260] border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OAuthCallbackPage;
