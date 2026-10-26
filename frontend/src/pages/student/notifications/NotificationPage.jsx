import React, { useState, useEffect } from 'react';
import { platformApi } from '../../../api/platformApi';
import { Link } from 'react-router-dom';
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  BrainCircuit,
  Compass,
  FileText,
  Bot,
  Megaphone,
  ArrowRight,
  Clock,
  Check,
} from 'lucide-react';

export const NotificationPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadNotifications = async () => {
    try {
      const res = await platformApi.getMyNotifications();
      if (res.success) {
        setNotifications(res.data || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      const res = await platformApi.markNotificationAsRead(id);
      if (res.success) {
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
      }
    } catch (err) {
      console.error('Failed to mark notification read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await platformApi.markAllNotificationsAsRead();
      if (res.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      }
    } catch (err) {
      console.error('Failed to mark all notifications read:', err);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'ASSESSMENT':
        return <BrainCircuit className="w-4 h-4 text-emerald-600" />;
      case 'ROADMAP':
        return <Compass className="w-4 h-4 text-indigo-600" />;
      case 'RESUME':
        return <FileText className="w-4 h-4 text-purple-600" />;
      case 'INTERVIEW':
        return <Bot className="w-4 h-4 text-teal-600" />;
      case 'ANNOUNCEMENT':
        return <Megaphone className="w-4 h-4 text-amber-600" />;
      default:
        return <Bell className="w-4 h-4 text-slate-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-brand-600 font-bold text-xs uppercase tracking-wider mb-1">
            <Bell className="w-4 h-4" />
            <span>In-App Alert Center</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Notifications &amp; Updates</h1>
          <p className="text-xs text-slate-500 mt-1">
            Stay informed on scheduled roadmap tasks, evaluated diagnostics, and placement announcements.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors self-start sm:self-auto"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 text-sm">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Notifications List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
        {notifications.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs font-medium">
            You have no notifications at this time.
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => !notif.read && handleMarkAsRead(notif.id)}
              className={`p-5 flex items-start gap-4 transition-colors cursor-pointer ${
                notif.read ? 'bg-white hover:bg-slate-50/80' : 'bg-brand-50/30 hover:bg-brand-50/60'
              }`}
            >
              {/* Type Icon */}
              <div className="p-2.5 rounded-2xl bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                {getIcon(notif.notificationType)}
              </div>

              {/* Content */}
              <div className="flex-grow">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h3 className={`text-sm font-bold ${notif.read ? 'text-slate-700' : 'text-slate-900'}`}>
                    {notif.title}
                  </h3>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1 font-semibold flex-shrink-0">
                    <Clock className="w-3 h-3" />
                    {new Date(notif.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed">{notif.message}</p>

                {notif.actionUrl && (
                  <Link
                    to={notif.actionUrl}
                    className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-700 mt-2"
                  >
                    <span>Go to Activity</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>

              {/* Unread Indicator */}
              {!notif.read && (
                <span className="w-2.5 h-2.5 rounded-full bg-brand-600 flex-shrink-0 mt-2"></span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
