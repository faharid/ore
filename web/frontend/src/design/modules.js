/** Module → design system class (DESIGN.md hierarchy) */
export const MODULE_DS_CLASS = {
  vpc: 'ds-module-vpc',
  ecs: 'ds-module-ecs',
  rds: 'ds-module-rds',
  alb: 'ds-module-alb',
  monitoring: 'ds-module-monitoring',
  autoscaling: 'ds-module-tertiary',
  secrets: 'ds-module-secondary',
  iam: 'ds-module-secondary',
  cloudfront: 'ds-module-secondary',
  budgets: 'ds-module-secondary',
  client_vpn: 'ds-module-secondary',
  ssm: 'ds-module-secondary'
};

export const MODULES = [
  { id: 'vpc', label: 'VPC', icon: '🌐', dsClass: MODULE_DS_CLASS.vpc },
  { id: 'ecs', label: 'ECS', icon: '🐳', dsClass: MODULE_DS_CLASS.ecs },
  { id: 'rds', label: 'RDS', icon: '🗄️', dsClass: MODULE_DS_CLASS.rds },
  { id: 'alb', label: 'ALB', icon: '⚖️', dsClass: MODULE_DS_CLASS.alb },
  { id: 'autoscaling', label: 'Autoscaling', icon: '📈', dsClass: MODULE_DS_CLASS.autoscaling },
  { id: 'monitoring', label: 'Monitoring', icon: '📊', dsClass: MODULE_DS_CLASS.monitoring },
  { id: 'secrets', label: 'Secrets', icon: '🔐', dsClass: MODULE_DS_CLASS.secrets },
  { id: 'iam', label: 'IAM', icon: '🔑', dsClass: MODULE_DS_CLASS.iam },
  { id: 'cloudfront', label: 'CloudFront', icon: '⚡', dsClass: MODULE_DS_CLASS.cloudfront },
  { id: 'budgets', label: 'Budgets', icon: '💰', dsClass: MODULE_DS_CLASS.budgets },
  { id: 'client_vpn', label: 'Client VPN', icon: '🔒', dsClass: MODULE_DS_CLASS.client_vpn },
  { id: 'ssm', label: 'SSM', icon: '⚙️', dsClass: MODULE_DS_CLASS.ssm }
];

export const MODULE_DEPENDENCIES = {
  vpc: [],
  ecs: ['vpc', 'alb', 'iam', 'secrets', 'rds'],
  rds: ['vpc'],
  alb: ['vpc'],
  autoscaling: ['ecs'],
  monitoring: ['ecs', 'rds', 'alb'],
  secrets: [],
  iam: [],
  cloudfront: ['alb'],
  budgets: ['monitoring'],
  client_vpn: ['vpc'],
  ssm: ['vpc']
};

export const MODULE_SIZE = 48;
export const MODULE_LABEL_OFFSET = 24;
