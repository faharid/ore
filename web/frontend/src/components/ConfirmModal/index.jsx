import { useEffect, useId, useState } from 'react';

export default function ConfirmModal({
  open,
  title,
  children,
  variant = 'danger',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  requireTyping,
  loading = false,
  error = '',
  onConfirm,
  onCancel,
  alertOnly = false
}) {
  const [typed, setTyped] = useState('');
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    setTyped('');
    const onKey = (e) => {
      if (e.key === 'Escape' && !loading) onCancel();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, loading, onCancel]);

  if (!open) return null;

  const typingRequired = Boolean(requireTyping?.value);
  const typingMatch = !typingRequired || typed === requireTyping.value;
  const typingMismatch =
    typingRequired && typed.length > 0 && typed !== requireTyping.value;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!typingMatch || loading) return;
    onConfirm();
  };

  return (
    <div
      className="ds-modal-backdrop"
      onClick={loading ? undefined : onCancel}
      role="presentation"
    >
      <div
        className="ds-modal"
        role="alertdialog"
        aria-labelledby={titleId}
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="ds-modal-header">
          {variant === 'danger' && (
            <span className="ds-modal-icon ds-modal-icon-danger" aria-hidden>
              <i className="ti ti-alert-triangle" />
            </span>
          )}
          {variant === 'alert' && (
            <span className="ds-modal-icon ds-modal-icon-alert" aria-hidden>
              <i className="ti ti-info-circle" />
            </span>
          )}
          <h2 id={titleId} className="ds-modal-title">
            {title}
          </h2>
        </div>

        <div className="ds-modal-body">{children}</div>

        {error && <p className="ds-modal-error">{error}</p>}

        {typingRequired && (
          <form onSubmit={handleSubmit} className="ds-modal-form">
            <label className="ds-label" htmlFor="confirm-typing">
              {requireTyping.label}
            </label>
            <input
              id="confirm-typing"
              type="text"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder={requireTyping.placeholder}
              className="ds-input"
              autoComplete="off"
              autoFocus
              disabled={loading}
            />
            {typingMismatch && (
              <p className="ds-error">Must match exactly: {requireTyping.value}</p>
            )}
          </form>
        )}

        <div className="ds-modal-actions">
          {!alertOnly && (
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="ds-btn-ghost"
            >
              {cancelLabel}
            </button>
          )}
          <button
            type="button"
            onClick={(e) => (alertOnly ? onCancel() : handleSubmit(e))}
            disabled={loading || (!alertOnly && !typingMatch)}
            className={
              alertOnly
                ? 'ds-btn-primary'
                : variant === 'danger'
                  ? 'ds-btn-danger'
                  : 'ds-btn-primary'
            }
          >
            {loading ? (
              <>
                <span className="ds-spinner mr-2" aria-hidden />
                Processing…
              </>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
