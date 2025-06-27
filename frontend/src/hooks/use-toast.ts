import { useState, useEffect } from 'react';

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
  duration?: number;
}

interface ToastState {
  toasts: Toast[];
}

const TOAST_REMOVE_DELAY = 1000000; // 1 second

let toastCount = 0;

function genId() {
  toastCount = (toastCount + 1) % Number.MAX_VALUE;
  return toastCount.toString();
}

const toastState: ToastState = {
  toasts: [],
};

let listeners: Array<(state: ToastState) => void> = [];

function dispatch(state: ToastState) {
  toastState.toasts = state.toasts;
  listeners.forEach((listener) => {
    listener(state);
  });
}

export function toast(props: Omit<Toast, 'id'>) {
  const id = genId();
  const duration = props.duration ?? 5000;

  const newToast: Toast = {
    ...props,
    id,
    duration,
  };

  dispatch({
    toasts: [...toastState.toasts, newToast],
  });

  if (duration > 0) {
    setTimeout(() => {
      dispatch({
        toasts: toastState.toasts.filter((t) => t.id !== id),
      });
    }, duration);
  }

  return {
    id,
    dismiss: () => {
      dispatch({
        toasts: toastState.toasts.filter((t) => t.id !== id),
      });
    },
  };
}

export function useToast() {
  const [state, setState] = useState<ToastState>(toastState);

  useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, [state]);

  return {
    toasts: state.toasts,
    toast,
    dismiss: (toastId?: string) => {
      dispatch({
        toasts: toastId
          ? toastState.toasts.filter((t) => t.id !== toastId)
          : [],
      });
    },
  };
}