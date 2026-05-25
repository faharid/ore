import { useEffect } from 'react';

export function useKeyboardShortcuts(handlers) {
  useEffect(() => {
    function handleKeyDown(e) {
      const mod = e.metaKey || e.ctrlKey;

      if (mod && e.key === 'p' && !e.shiftKey) {
        e.preventDefault();
        handlers.onPlan?.();
      }
      if (mod && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        handlers.onApply?.();
      }
      if (mod && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        handlers.onDestroy?.();
      }
      if (e.key === 'Escape') {
        handlers.onClose?.();
      }
      if (mod && e.key === 'k') {
        e.preventDefault();
        handlers.onSearch?.();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlers]);
}
