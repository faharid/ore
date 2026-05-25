import { CloudWatchClient, GetMetricStatisticsCommand } from '@aws-sdk/client-cloudwatch';
import { ECSClient, DescribeServicesCommand, ListServicesCommand } from '@aws-sdk/client-ecs';

const cloudWatchClient = new CloudWatchClient({
  region: process.env.AWS_REGION || 'us-east-1'
});

const ecsClient = new ECSClient({
  region: process.env.AWS_REGION || 'us-east-1'
});

// Get ECS CPU/Memory metrics
export async function getECSMetrics(clusterName, serviceName) {
  const now = new Date();
  const startTime = new Date(now.getTime() - 60 * 60 * 1000); // Last hour

  try {
    const [cpuMetric, memMetric, taskCount] = await Promise.all([
      getMetricStatistic(
        'AWS/ECS',
        'CPUUtilization',
        { name: 'ClusterName', value: clusterName },
        { name: 'ServiceName', value: serviceName },
        startTime,
        now,
        300 // 5-minute period
      ),
      getMetricStatistic(
        'AWS/ECS',
        'MemoryUtilization',
        { name: 'ClusterName', value: clusterName },
        { name: 'ServiceName', value: serviceName },
        startTime,
        now,
        300
      ),
      getECSTaskCount(clusterName, serviceName)
    ]);

    return {
      cpu: cpuMetric,
      memory: memMetric,
      taskCount
    };
  } catch (err) {
    console.error('Failed to get ECS metrics:', err);
    return { cpu: null, memory: null, taskCount: null, error: err.message };
  }
}

// Get RDS metrics
export async function getRDSMetrics(dbInstanceId) {
  const now = new Date();
  const startTime = new Date(now.getTime() - 60 * 60 * 1000);

  try {
    const [cpuMetric, storageMetric] = await Promise.all([
      getMetricStatistic(
        'AWS/RDS',
        'CPUUtilization',
        { name: 'DBInstanceIdentifier', value: dbInstanceId },
        null,
        startTime,
        now,
        300
      ),
      getMetricStatistic(
        'AWS/RDS',
        'FreeStorageSpace',
        { name: 'DBInstanceIdentifier', value: dbInstanceId },
        null,
        startTime,
        now,
        300
      )
    ]);

    return {
      cpu: cpuMetric,
      freeStorage: storageMetric ? storageMetric / 1024 / 1024 / 1024 : null // Convert to GB
    };
  } catch (err) {
    console.error('Failed to get RDS metrics:', err);
    return { cpu: null, freeStorage: null, error: err.message };
  }
}

// Get ALB metrics
export async function getALBMetrics(loadBalancerArn) {
  const now = new Date();
  const startTime = new Date(now.getTime() - 60 * 60 * 1000);
  const albArnSuffix = loadBalancerArn.split('loadbalancer/')[1] || '';

  try {
    const [requestCountMetric, error5xxMetric, responseTimeMetric] = await Promise.all([
      getMetricStatistic(
        'AWS/ApplicationELB',
        'RequestCount',
        { name: 'LoadBalancer', value: albArnSuffix },
        null,
        startTime,
        now,
        300
      ),
      getMetricStatistic(
        'AWS/ApplicationELB',
        'HTTPCode_Target_5XX_Count',
        { name: 'LoadBalancer', value: albArnSuffix },
        null,
        startTime,
        now,
        300
      ),
      getMetricStatistic(
        'AWS/ApplicationELB',
        'TargetResponseTime',
        { name: 'LoadBalancer', value: albArnSuffix },
        null,
        startTime,
        now,
        300
      )
    ]);

    return {
      requestCount: requestCountMetric || 0,
      errors5xx: error5xxMetric || 0,
      responseTime: responseTimeMetric ? (responseTimeMetric * 1000).toFixed(2) : null // Convert to ms
    };
  } catch (err) {
    console.error('Failed to get ALB metrics:', err);
    return { requestCount: null, errors5xx: null, responseTime: null, error: err.message };
  }
}

// Helper: get metric statistic
async function getMetricStatistic(
  namespace,
  metricName,
  dimension1,
  dimension2,
  startTime,
  endTime,
  period
) {
  const dimensions = [dimension1];
  if (dimension2) dimensions.push(dimension2);

  const command = new GetMetricStatisticsCommand({
    Namespace: namespace,
    MetricName: metricName,
    Dimensions: dimensions,
    StartTime: startTime,
    EndTime: endTime,
    Period: period,
    Statistics: ['Average', 'Maximum']
  });

  try {
    const response = await cloudWatchClient.send(command);
    if (response.Datapoints && response.Datapoints.length > 0) {
      const latest = response.Datapoints.sort((a, b) => b.Timestamp - a.Timestamp)[0];
      return latest.Average || latest.Maximum;
    }
    return null;
  } catch (err) {
    console.error(`Failed to get metric ${metricName}:`, err);
    return null;
  }
}

// Get ECS task count
async function getECSTaskCount(clusterName, serviceName) {
  try {
    const command = new DescribeServicesCommand({
      cluster: clusterName,
      services: [serviceName]
    });

    const response = await ecsClient.send(command);
    if (response.services && response.services.length > 0) {
      const service = response.services[0];
      return {
        running: service.runningCount || 0,
        desired: service.desiredCount || 0,
        pending: service.pendingCount || 0
      };
    }
    return { running: 0, desired: 0, pending: 0 };
  } catch (err) {
    console.error('Failed to get ECS task count:', err);
    return { running: null, desired: null, pending: null, error: err.message };
  }
}
