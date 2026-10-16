import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Info, Compass, Sparkles, X } from 'lucide-react';
import {
  notificationManager,
  ActiveNotification,
  NotificationPriority,
} from '../../services/notifications/notificationManager';
import './feedback.css';

interface FeedbackToastProps {
  feedback?: {
    message: string;
    success: boolean;
    timestamp: number;
  } | null;
}

export const FeedbackToast: React.FC<FeedbackToastProps> = ({ feedback }) => {
  const [activeNotif, setActiveNotif] = useState<ActiveNotification | null>(null);

  // Subscribe to centralized notification manager
  useEffect(() => {
    const unsubscribe = notificationManager.subscribe((notif) => {
      setActiveNotif(notif);
    });
    return unsubscribe;
  }, []);

  // Sync external feedback prop if provided (for backward-compatibility with tests)
  useEffect(() => {
    if (feedback && feedback.message) {
      const priority: NotificationPriority = !feedback.success
        ? 'critical'
        : feedback.message.toLowerCase().includes('retrieved') ||
          feedback.message.toLowerCase().includes('collected')
        ? 'success'
        : feedback.message.toLowerCase().includes('objective') ||
          feedback.message.toLowerCase().includes('unlocked')
        ? 'objective'
        : 'info';

      notificationManager.notify(feedback.message, priority);
    }
  }, [feedback]);

  if (!activeNotif) return null;

  const getIcon = () => {
    switch (activeNotif.priority) {
      case 'critical':
        return <AlertCircle size={16} className="toast-icon-critical" />;
      case 'objective':
        return <Compass size={16} className="toast-icon-objective" />;
      case 'discovery':
        return <Sparkles size={16} className="toast-icon-discovery" />;
      case 'success':
        return <CheckCircle2 size={16} className="toast-icon-success" />;
      default:
        return <Info size={16} className="toast-icon-info" />;
    }
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className={`feedback-toast toast-priority-${activeNotif.priority}`}
    >
      <div className="feedback-icon">{getIcon()}</div>
      <p className="feedback-message">{activeNotif.message}</p>
      <button
        type="button"
        className="toast-dismiss-btn"
        onClick={() => notificationManager.dismiss()}
        aria-label="Dismiss notification"
      >
        <X size={13} />
      </button>
    </div>
  );
};
