import React from 'react';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';
import './feedback.css';

interface FeedbackToastProps {
  feedback: {
    message: string;
    success: boolean;
    timestamp: number;
  } | null;
}

export const FeedbackToast: React.FC<FeedbackToastProps> = ({ feedback }) => {
  if (!feedback) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`feedback-toast ${feedback.success ? 'feedback-success' : 'feedback-warning'}`}
    >
      <div className="feedback-icon">
        {feedback.success ? (
          <CheckCircle2 size={18} />
        ) : feedback.message.includes('reject') || feedback.message.includes('seal') ? (
          <AlertCircle size={18} />
        ) : (
          <Info size={18} />
        )}
      </div>
      <p className="feedback-message">{feedback.message}</p>
    </div>
  );
};
