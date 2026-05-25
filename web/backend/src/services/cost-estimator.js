const INSTANCE_HOURLY = {
  'db.t3.micro': 0.017,
  'db.t3.small': 0.034,
  'db.t3.medium': 0.068,
  'db.t3.large': 0.136,
  'db.m5.large': 0.192
};

const HOURS_PER_MONTH = 730;

function fargateCpuMonthly(cpu, count = 1) {
  return (cpu / 1024) * 0.04048 * count * HOURS_PER_MONTH;
}

function fargateMemoryMonthly(memory, count = 1) {
  return (memory / 1024) * 0.004445 * count * HOURS_PER_MONTH;
}

function rdsMonthly(instanceClass, storage, multiAz) {
  const hourly = INSTANCE_HOURLY[instanceClass] || 0.068;
  const instanceCost = hourly * HOURS_PER_MONTH * (multiAz ? 2 : 1);
  const storageCost = (storage || 100) * 0.023;
  return instanceCost + storageCost;
}

export function estimateCost(config = {}) {
  const desired = config.ecs_desired_count ?? 2;
  const cpu = config.ecs_cpu ?? 512;
  const memory = config.ecs_memory ?? 1024;
  const multiAz = config.rds_multi_az === true;

  const ecs =
    fargateCpuMonthly(cpu, desired) + fargateMemoryMonthly(memory, desired);
  const rds = rdsMonthly(
    config.rds_instance_class || 'db.t3.medium',
    config.rds_allocated_storage || 100,
    multiAz
  );
  const alb = 18;
  const nat = config.single_nat_gateway ? 10.8 : 32.4;
  const cloudfront = config.enable_cloudfront ? 10 : 0;
  const secrets = 1;
  const monitoring = 5;

  const breakdown = {
    ecs: Math.round(ecs * 100) / 100,
    rds: Math.round(rds * 100) / 100,
    alb,
    natGateway: nat,
    cloudfront,
    secrets,
    monitoring
  };

  const totalMonthlyCost = Object.values(breakdown).reduce((a, b) => a + b, 0);

  return {
    totalMonthlyCost: Math.round(totalMonthlyCost * 100) / 100,
    totalYearlyCost: Math.round(totalMonthlyCost * 12 * 100) / 100,
    breakdown,
    currency: 'USD',
    region: config.aws_region || 'us-east-1',
    note: 'Approximate estimate based on docs/COST-ANALYSIS.md — use AWS Pricing Calculator for production.'
  };
}
