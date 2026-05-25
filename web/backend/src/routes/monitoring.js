import express from 'express';
import { getECSMetrics, getRDSMetrics, getALBMetrics } from '../services/aws-metrics.js';
import * as configService from '../services/config.js';
import { getOutputs } from '../services/terraform.js';

const router = express.Router();

// GET /api/environments/:env/metrics - get all metrics
router.get('/:env/metrics', async (req, res, next) => {
  try {
    const { env } = req.params;

    // Read environment config
    await configService.readConfig(env);

    // Get terraform outputs to get resource names
    let outputs = {};
    try {
      outputs = await getOutputs(env);
    } catch {
      // Outputs might not be available if infrastructure not deployed
    }

    const ecsClusterName = outputs.ecs_cluster_name?.value;
    const ecsServiceName = outputs.ecs_service_name?.value;
    const rdsInstanceId = outputs.rds_instance_id?.value;
    const albArn = outputs.alb_arn?.value;

    const metrics = {
      timestamp: new Date().toISOString(),
      ecs: null,
      rds: null,
      alb: null
    };

    // Fetch metrics if resources exist
    if (ecsClusterName && ecsServiceName) {
      metrics.ecs = await getECSMetrics(ecsClusterName, ecsServiceName);
    }

    if (rdsInstanceId) {
      metrics.rds = await getRDSMetrics(rdsInstanceId);
    }

    if (albArn) {
      metrics.alb = await getALBMetrics(albArn);
    }

    res.json(metrics);
  } catch (err) {
    next(err);
  }
});

// GET /api/environments/:env/status - get infrastructure status
router.get('/:env/status', async (req, res, next) => {
  try {
    const { env } = req.params;

    // Read environment config
    const config = await configService.readConfig(env);

    // Get outputs
    let outputs = {};
    try {
      outputs = await getOutputs(env);
    } catch {
      return res.json({
        status: 'not_deployed',
        message: 'Infrastructure not deployed',
        environment: env
      });
    }

    // Check if we have the key outputs
    const hasAllOutputs = outputs.alb_dns_name && outputs.ecs_cluster_name && outputs.rds_endpoint;

    res.json({
      status: hasAllOutputs ? 'deployed' : 'partial',
      environment: env,
      outputs: {
        albDnsName: outputs.alb_dns_name?.value,
        ecsClusterName: outputs.ecs_cluster_name?.value,
        ecsServiceName: outputs.ecs_service_name?.value,
        rdsEndpoint: outputs.rds_endpoint?.value,
        applicationUrl: outputs.application_url?.value,
        ecrRepositoryUrl: outputs.ecr_repository_url?.value
      },
      config: {
        projectName: config.project_name,
        awsRegion: config.aws_region,
        containerImage: config.container_image,
        rdsInstanceClass: config.rds_instance_class
      }
    });
  } catch (err) {
    if (err.status === 404) {
      return res.status(404).json({ error: 'Environment not found' });
    }
    next(err);
  }
});

export default router;
