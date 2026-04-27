import { useState, useEffect, useCallback, createContext, useContext } from "react";

type ToastType = "error" | "success" | "info";

type ToastItem = {
  id: number;
  message: string;
  type: ToastType;
};

type ToastContextValue = {
  showToast: (message: string, type?: ToastType) => void;
};

const ToastContext = createContext<ToastContextValue>({
  showToast: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

let nextId = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "error") => {
    const id = nextId++;
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <ToastMessage key={toast.id} toast={toast} onDismiss={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastMessage({ toast, onDismiss }: { toast: ToastItem; onDismiss: (id: number) => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onDismiss(toast.id), 300);
    }, 5000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const bgColor =
    toast.type === "error"
      ? "bg-red-900/90 border-red-700/50"
      : toast.type === "success"
        ? "bg-green-900/90 border-green-700/50"
        : "bg-amber-900/90 border-amber-700/50";

  const textColor =
    toast.type === "error"
      ? "text-red-100"
      : toast.type === "success"
        ? "text-green-100"
        : "text-amber-100";

  return (
    <div
      className={`max-w-sm rounded-lg border px-4 py-3 shadow-lg backdrop-blur transition-all duration-300 ${bgColor} ${textColor} ${
        visible ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0"
      }`}
    >
      <div className="flex items-start gap-2">
        <span className="flex-1 text-sm">{toast.message}</span>
        <button
          onClick={() => {
            setVisible(false);
            setTimeout(() => onDismiss(toast.id), 300);
          }}
          className="shrink-0 text-xs opacity-60 hover:opacity-100"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
