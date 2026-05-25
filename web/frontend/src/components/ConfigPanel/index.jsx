import { useState, useEffect, useRef, useCallback } from 'react';
import { environmentApi } from '../../services/api';

const MODULE_FIELDS = {
  vpc: [
    { name: 'vpc_cidr', label: 'VPC CIDR', type: 'text', default: '10.0.0.0/16', required: true, validate: 'cidr' },
    { name: 'single_nat_gateway', label: 'Single NAT Gateway', type: 'checkbox' },
    { name: 'enable_vpc_flow_logs', label: 'Enable Flow Logs', type: 'checkbox' }
  ],
  ecs: [
    { name: 'container_image', label: 'Container Image', type: 'text', required: true },
    { name: 'container_port', label: 'Container Port', type: 'number', default: 3001, min: 1, max: 65535 },
    { name: 'ecs_cpu', label: 'CPU Units', type: 'number', default: 512, min: 256, validate: 'cpu' },
    { name: 'ecs_memory', label: 'Memory (MB)', type: 'number', default: 1024, min: 512 },
    { name: 'ecs_desired_count', label: 'Desired Tasks', type: 'number', default: 2, min: 1 }
  ],
  rds: [
    { name: 'rds_instance_class', label: 'Instance Class', type: 'text', default: 'db.t3.medium', required: true },
    { name: 'rds_allocated_storage', label: 'Storage (GB)', type: 'number', default: 100, min: 20, max: 65536 },
    { name: 'rds_engine_version', label: 'PostgreSQL Version', type: 'text', default: '15' },
    { name: 'rds_multi_az', label: 'Multi-AZ', type: 'checkbox' },
    { name: 'rds_backup_retention_period', label: 'Backup Retention (days)', type: 'number', default: 30, min: 1, max: 35 }
  ],
  alb: [
    { name: 'domain_name', label: 'Domain Name', type: 'text' },
    { name: 'enable_https', label: 'Enable HTTPS', type: 'checkbox' },
    { name: 'health_check_path', label: 'Health Check Path', type: 'text', default: '/', required: true }
  ],
  autoscaling: [
    { name: 'ecs_min_capacity', label: 'Min Capacity', type: 'number', default: 1, min: 1 },
    { name: 'ecs_max_capacity', label: 'Max Capacity', type: 'number', default: 10, min: 1 },
    { name: 'ecs_scale_up_threshold', label: 'Scale Up Threshold (%)', type: 'number', default: 70, min: 0, max: 100 },
    { name: 'ecs_scale_down_threshold', label: 'Scale Down Threshold (%)', type: 'number', default: 30, min: 0, max: 100 }
  ],
  monitoring: [
    { name: 'alarm_email', label: 'Alarm Email', type: 'email', validate: 'email' },
    { name: 'enable_datadog_forwarder', label: 'Enable Datadog', type: 'checkbox' }
  ],
  secrets: [
    { name: 'database_password', label: 'Database Password', type: 'password', required: true, minLength: 8 },
    { name: 'jwt_secret', label: 'JWT Secret', type: 'password', required: true, minLength: 16 }
  ],
  iam: [],
  cloudfront: [
    { name: 'enable_cloudfront', label: 'Enable CloudFront', type: 'checkbox' },
    { name: 'cloudfront_price_class', label: 'Price Class', type: 'text', default: 'PriceClass_100' }
  ],
  budgets: [
    { name: 'enable_budgets', label: 'Enable Budgets', type: 'checkbox' },
    { name: 'monthly_budget_limit', label: 'Monthly Limit ($)', type: 'text', default: '200', validate: 'number' }
  ],
  client_vpn: [{ name: 'enable_client_vpn', label: 'Enable Client VPN', type: 'checkbox' }],
  ssm: [{ name: 'enable_ssm_endpoints', label: 'Enable SSM Endpoints', type: 'checkbox' }]
};

/** Value shown in the form: stored config, else field default */
function getFieldValue(config, field) {
  if (Object.prototype.hasOwnProperty.call(config, field.name)) {
    return config[field.name];
  }
  if (field.type === 'checkbox') return false;
  if (field.default !== undefined) return field.default;
  return '';
}

function normalizeFieldValue(field, value) {
  if (field.type === 'checkbox') return Boolean(value);
  if (field.type === 'number') {
    if (value === '' || value === null || value === undefined) return value;
    const num = Number(value);
    return Number.isNaN(num) ? value : num;
  }
  return value;
}

const validateField = (field, value) => {
  if (field.type === 'checkbox') return null;

  const empty =
    value === undefined ||
    value === null ||
    (typeof value === 'string' && value.trim() === '');

  if (field.required && empty) return `${field.label} is required`;

  if (field.type === 'number' && !empty) {
    const num = Number(value);
    if (Number.isNaN(num)) return `${field.label} must be a number`;
    if (field.min !== undefined && num < field.min) {
      return `${field.label} must be at least ${field.min}`;
    }
    if (field.max !== undefined && num > field.max) {
      return `${field.label} must be at most ${field.max}`;
    }
  }
  if (field.type === 'email' || field.validate === 'email') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (value && !emailRegex.test(value)) return `${field.label} is invalid`;
  }
  if (field.validate === 'cidr') {
    const cidrRegex = /^(\d{1,3}\.){3}\d{1,3}\/\d{1,2}$/;
    if (value && !cidrRegex.test(value)) return `${field.label} must be valid CIDR (e.g. 10.0.0.0/16)`;
  }
  if (field.minLength && value && value.length < field.minLength) {
    return `${field.label} must be at least ${field.minLength} characters`;
  }
  return null;
};

export default function ConfigPanel({ env, node, onSave }) {
  const [config, setConfig] = useState({});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const saveTimerRef = useRef(null);

  const fields = MODULE_FIELDS[node] || [];

  useEffect(() => {
    setLoading(true);
    setErrors({});
    setMessage('');
    loadConfig();
  }, [env, node]);

  const loadConfig = async () => {
    try {
      const response = await environmentApi.get(env);
      setConfig(response.data);
      setErrors({});
      setMessage('');
    } catch (err) {
      console.error('Failed to load config:', err);
      setMessage('Error loading configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (fieldName, rawValue) => {
    const field = fields.find((f) => f.name === fieldName);
    const value = normalizeFieldValue(field, rawValue);
    const error = validateField(field, value);
    setConfig((prev) => ({ ...prev, [fieldName]: value }));
    setErrors((prev) => ({ ...prev, [fieldName]: error }));
  };

  const validateAll = () => {
    const newErrors = {};
    fields.forEach((field) => {
      const value = getFieldValue(config, field);
      const error = validateField(field, value);
      if (error) newErrors[field.name] = error;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const buildPayload = () => {
    const payload = { ...config };
    fields.forEach((field) => {
      payload[field.name] = normalizeFieldValue(field, getFieldValue(config, field));
    });
    return payload;
  };

  const performSave = useCallback(async () => {
    if (!validateAll()) {
      setMessage('Fix validation errors before saving');
      return;
    }
    setSaving(true);
    setMessage('');
    try {
      const payload = buildPayload();
      await environmentApi.update(env, payload);
      setConfig(payload);
      setMessage('Configuration saved successfully');
      setTimeout(() => setMessage(''), 3000);
      onSave?.();
    } catch (err) {
      setMessage('Error saving configuration: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  }, [env, config, fields, onSave]);

  const handleSave = () => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(performSave, 500);
  };

  useEffect(
    () => () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    },
    []
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-ore-text-tertiary text-ore-body">
        Loading...
      </div>
    );
  }

  const messageIsError = message.includes('Error') || message.includes('Fix');

  return (
    <div className="flex flex-col h-full -m-4">
      <div className="px-4 pt-2 pb-3 border-b border-ore-border shrink-0">
        <h3 className="ds-headline capitalize m-0">{node}</h3>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {fields.length === 0 ? (
          <p className="ds-card-text">No configuration options for this module</p>
        ) : (
          fields.map((field) => (
            <div key={field.name}>
              <label className="ds-label">
                {field.label}
                {field.required && <span className="text-ore-error"> *</span>}
              </label>
              {field.type === 'checkbox' ? (
                <input
                  type="checkbox"
                  checked={Boolean(getFieldValue(config, field))}
                  onChange={(e) => handleChange(field.name, e.target.checked)}
                  className="w-4 h-4 accent-ore-accent"
                />
              ) : (
                <>
                  <input
                    type={field.type}
                    value={getFieldValue(config, field)}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    placeholder={String(field.default ?? '')}
                    className="ds-input"
                  />
                  {errors[field.name] && <p className="ds-error">{errors[field.name]}</p>}
                </>
              )}
            </div>
          ))
        )}
      </div>

      <div className="px-4 py-4 border-t border-ore-border space-y-2 shrink-0">
        {message &&
          (messageIsError ? (
            <div className="ds-alert-error text-ore-label">{message}</div>
          ) : (
            <div className="ds-success text-ore-label">{message}</div>
          ))}
        <button type="button" onClick={handleSave} disabled={saving} className="ds-btn-primary w-full">
          {saving ? 'Saving...' : 'Save Config'}
        </button>
      </div>
    </div>
  );
}
