import { useState, useEffect, useRef } from 'react';
import { streamTerraformCommand } from '../../services/api';

const MAX_LINES = 1000;

const stripANSI = (str) => {
  if (typeof str !== 'string') return str;
  return str.replace(/\x1b\[[0-9;]*m/g, '').replace(/\033\[[0-9;]*m/g, '');
};

const lineClass = (type, text) => {
  if (type === 'error') return 'ds-term-error';
  if (type === 'success') return 'ds-term-success';
  if (type === 'warn') return 'ds-term-warning';
  if (type === 'info') return 'ds-term-info';
  if (type === 'stderr') return 'ds-term-warning';
  const t = stripANSI(text);
  if (t.includes('Error') || t.includes('error')) return 'ds-term-error';
  if (t.includes('Warning')) return 'ds-term-warning';
  if (t.includes('created') || t.includes('modified') || t.includes('destroyed'))
    return 'ds-term-success';
  if (t.includes('will be') || t.includes('will create')) return 'ds-term-info';
  return 'ds-term-line';
};

export default function Terminal({ env, command, onClose, onApply }) {
  const [output, setOutput] = useState([]);
  const [status, setStatus] = useState('running');
  const [startTime, setStartTime] = useState(null);
  const [duration, setDuration] = useState(0);
  const scrollRef = useRef(null);
  const abortRef = useRef(null);

  const addEvent = (event) => {
    setOutput((prev) => {
      const next = [...prev, event];
      if (next.length > MAX_LINES) return next.slice(-MAX_LINES);
      return next;
    });
    if (event.type === 'error') setStatus('error');
    if (event.type === 'success') setStatus('success');
  };

  useEffect(() => {
    runCommand();
    return () => abortRef.current?.abort();
  }, [command]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [output]);

  useEffect(() => {
    if (status !== 'running' || !startTime) return;
    const timer = setInterval(() => {
      setDuration(Math.floor((Date.now() - startTime) / 1000));
    }, 100);
    return () => clearInterval(timer);
  }, [status, startTime]);

  const runCommand = async (actionOverride, autoApprove = false) => {
    const action = actionOverride || command.action;
    setOutput([]);
    setStatus('running');
    setStartTime(Date.now());
    setDuration(0);

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    try {
      await streamTerraformCommand(env, action, {
        autoApprove,
        signal: abortRef.current.signal,
        onEvent: addEvent
      });
      setStatus((s) => (s === 'error' ? 'error' : 'success'));
    } catch (err) {
      if (err.name === 'AbortError') return;
      addEvent({ type: 'error', message: err.message || 'Command failed' });
      setStatus('error');
    }
  };

  const handleCopy = () => {
    const text = output.map((o) => stripANSI(o.message || '')).join('\n');
    navigator.clipboard.writeText(text);
  };

  const handleApply = () => {
    runCommand('apply', true);
    onApply?.();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-ore-border flex justify-between items-center">
        <div>
          <h3 className="ds-headline capitalize">{command.action}</h3>
          <p className="text-ore-label text-ore-text-tertiary mt-1 flex items-center gap-2">
            {status === 'running' ? (
              <>
                <span className="ds-spinner" aria-hidden />
                Running… {duration}s
              </>
            ) : (
              `Completed in ${duration}s`
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={handleCopy} className="ds-btn-secondary text-ore-label py-1 px-2">
            Copy
          </button>
          <button type="button" onClick={onClose} className="ds-btn-secondary text-ore-label py-1 px-2">
            Close
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="ds-terminal mx-4 mb-0">
        {output.length === 0 ? (
          <div className="ds-term-line">Streaming terraform output…</div>
        ) : (
          output.map((line, idx) => (
            <div key={idx} className={lineClass(line.type, line.message)}>
              {stripANSI(line.message)}
            </div>
          ))
        )}
      </div>

      <div className="p-4 border-t border-ore-border space-y-2">
        {status === 'success' && (
          <div className="text-center">
            <p className="ds-term-success text-ore-body mb-3">✓ Command completed successfully</p>
            {command.action === 'plan' && (
              <button type="button" onClick={handleApply} className="ds-btn-primary w-full">
                Apply Changes
              </button>
            )}
          </div>
        )}
        {status === 'error' && (
          <div className="ds-alert-error">
            <p className="ds-term-error font-semibold m-0">✗ Command failed</p>
          </div>
        )}
      </div>
    </div>
  );
}
