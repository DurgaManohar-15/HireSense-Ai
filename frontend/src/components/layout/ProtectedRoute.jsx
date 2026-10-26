import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

export const ProtectedRoute = ({ requiredRole }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#000000] text-white">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
        <p className="mt-4 text-[#71717A] font-medium text-xs tracking-wide">Authenticating session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && !user?.roles?.includes(requiredRole)) {
    return <Navigate to="/dashboard" replace />;
  }

  const location = useLocation();
  const isFullBleed = location.pathname.startsWith('/resume/builder') || location.pathname.startsWith('/coding/') || location.pathname.includes('/room');

  return (
    <div className="fixed inset-0 h-screen w-screen flex flex-col bg-[#05070A] text-[#F7F7F5] overflow-hidden select-text">
      <Navbar />
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <Sidebar />
        <main
          className={
            isFullBleed
              ? "flex-1 overflow-hidden flex flex-col min-w-0 bg-[#05070A]"
              : "flex-1 p-6 md:p-8 overflow-y-auto overscroll-none w-full bg-[#05070A]"
          }
        >
          <div className={isFullBleed ? "h-full w-full" : "max-w-7xl mx-auto"}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProtectedRoute;
