import React from 'react';
import { ShieldAlert, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
}

interface NotificationToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let Icon = Info;
        let borderColor = 'border-cyber-cyan/50';
        let iconColor = 'text-cyber-cyan';

        if (toast.type === 'success') {
          Icon = CheckCircle2;
          borderColor = 'border-cyber-green/50';
          iconColor = 'text-cyber-green';
        } else if (toast.type === 'error') {
          Icon = ShieldAlert;
          borderColor = 'border-cyber-crimson/60';
          iconColor = 'text-cyber-crimson';
        } else if (toast.type === 'warning') {
          Icon = AlertTriangle;
          borderColor = 'border-cyber-amber/50';
          iconColor = 'text-cyber-amber';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-3.5 rounded-xl bg-cyber-card/95 backdrop-blur-md border ${borderColor} shadow-2xl flex items-start space-x-3 transition-all transform animate-in slide-in-from-bottom-2 duration-200`}
          >
            <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconColor}`} />
            <div className="flex-1">
              <div className="text-xs font-semibold text-white">{toast.title}</div>
              <div className="text-[11px] text-slate-300 mt-0.5 leading-snug">{toast.message}</div>
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="p-1 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
