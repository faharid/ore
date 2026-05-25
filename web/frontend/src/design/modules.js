/** Infrastructure modules — icons use Tabler (ti ti-*) */
export const MODULES = [
  { id: 'vpc', label: 'VPC', subtitle: 'Network', icon: 'ti-network' },
  { id: 'alb', label: 'ALB', subtitle: 'Load Balancer', icon: 'ti-scale' },
  { id: 'ecs', label: 'ECS', subtitle: 'Fargate', icon: 'ti-box' },
  { id: 'rds', label: 'RDS', subtitle: 'PostgreSQL', icon: 'ti-database' },
  { id: 'secrets', label: 'Secrets', subtitle: 'Manager', icon: 'ti-lock' },
  { id: 'monitoring', label: 'Monitoring', subtitle: 'CloudWatch', icon: 'ti-chart-bar' },
  { id: 'iam', label: 'IAM', subtitle: 'Roles', icon: 'ti-shield-check' },
  { id: 'autoscaling', label: 'Autoscaling', subtitle: 'Policies', icon: 'ti-arrows-vertical' },
  { id: 'cloudfront', label: 'CloudFront', subtitle: 'CDN', icon: 'ti-cloud' },
  { id: 'budgets', label: 'Budgets', subtitle: 'Alerts', icon: 'ti-currency-dollar' },
  { id: 'client_vpn', label: 'Client VPN', subtitle: 'Access', icon: 'ti-lock-access' },
  { id: 'ssm', label: 'SSM', subtitle: 'Endpoints', icon: 'ti-settings' }
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

export const MODULE_CARD_WIDTH = 130;
export const MODULE_CARD_HEIGHT = 96;
export const MODULE_LABEL_OFFSET = 8;
