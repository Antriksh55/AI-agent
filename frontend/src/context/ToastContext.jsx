import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle, XCircle, Info, X } from "lucide-react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback((message, type = "info", duration = 3500) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), duration);
  }, []);

  const remove = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  const icons = { success: CheckCircle, error: XCircle, info: Info };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="toast-container">
        {toasts.map((t) => {
          const Icon = icons[t.type] || Info;
          return (
            <div key={t.id} className={`toast ${t.type}`}>
              <Icon size={16} />
              <span style={{ flex: 1 }}>{t.message}</span>
              <button className="btn-ghost btn-icon btn" style={{ padding: 2 }} onClick={() => remove(t.id)}>
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
