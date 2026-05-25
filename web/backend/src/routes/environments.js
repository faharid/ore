import express from 'express';
import * as configService from '../services/config.js';
import { estimateCost } from '../services/cost-estimator.js';
import { appendCostSnapshot, getCostHistory } from '../services/cost-history.js';
import { invalidateCache } from '../middleware/cache.js';

const router = express.Router();

router.get('/cost-history', async (req, res, next) => {
  try {
    const history = await getCostHistory();
    res.json({ history });
  } catch (err) {
    next(err);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const environments = await configService.listEnvironments(req.workspace);
    res.json({ environments });
  } catch (err) {
    next(err);
  }
});

router.get('/:env/cost-estimate', async (req, res, next) => {
  try {
    const { env } = req.params;
    const config = await configService.readConfig(env, req.workspace);
    const estimate = estimateCost(config);
    res.json(estimate);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    next(err);
  }
});

router.get('/:env', async (req, res, next) => {
  try {
    const { env } = req.params;
    const config = await configService.readConfig(env, req.workspace);
    res.json(config);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { env, config } = req.body;

    if (!env) {
      return res.status(400).json({ error: 'env name required' });
    }

    const defaultConfig = {
      project_name: 'ore',
      environment: env,
      aws_region: 'us-east-1',
      aws_account_id: '',
      vpc_cidr: '10.0.0.0/16',
      public_subnet_cidrs: ['10.0.1.0/24', '10.0.2.0/24'],
      private_subnet_cidrs: ['10.0.10.0/24', '10.0.11.0/24'],
      single_nat_gateway: env === 'dev',
      container_image: 'nginx:alpine',
      container_port: 80,
      health_check_path: '/',
      ecs_cpu: 512,
      ecs_memory: 1024,
      ecs_desired_count: env === 'dev' ? 1 : 2,
      ecs_min_capacity: 1,
      ecs_max_capacity: env === 'dev' ? 5 : 10,
      ecs_scale_up_threshold: 70,
      ecs_scale_down_threshold: 30,
      rds_instance_class: env === 'dev' ? 'db.t3.micro' : 'db.t3.medium',
      rds_allocated_storage: 100,
      rds_multi_az: env === 'prod',
      rds_engine_version: '15',
      rds_database_name: 'saasdb',
      rds_master_username: 'postgres',
      rds_backup_retention_period: env === 'dev' ? 7 : 30,
      rds_deletion_protection: env === 'prod',
      rds_skip_final_snapshot: env === 'dev',
      domain_name: '',
      enable_https: true,
      enable_cloudfront: false,
      enable_client_vpn: false,
      enable_ssm_endpoints: true,
      enable_budgets: env === 'prod',
      monthly_budget_limit: '200',
      alarm_email: '',
      database_password: '',
      jwt_secret: '',
      ...config
    };

    const result = await configService.writeConfig(env, defaultConfig, req.workspace);
    invalidateCache('/environments');
    await appendCostSnapshot(env, req.workspace, result);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

router.put('/:env', async (req, res, next) => {
  try {
    const { env } = req.params;
    const updates = req.body;

    let config = await configService.readConfig(env, req.workspace);
    config = { ...config, ...updates };

    const result = await configService.writeConfig(env, config, req.workspace);
    invalidateCache('/environments');
    await appendCostSnapshot(env, req.workspace, result);
    res.json(result);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    next(err);
  }
});

router.delete('/:env', async (req, res, next) => {
  try {
    const { env } = req.params;
    await configService.deleteConfig(env, req.workspace);
    invalidateCache('/environments');
    res.status(204).send();
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    next(err);
  }
});

export default router;
