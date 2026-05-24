# ECS deploy permissions are attached after the ECS service exists to avoid circular deps.
resource "aws_iam_role_policy" "deployment_ecs" {
  name = "${local.name_prefix}-deployment-ecs"
  role = module.iam.deployment_role_name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ecs:UpdateService",
          "ecs:DescribeServices",
          "ecs:DescribeTaskDefinition",
          "ecs:RegisterTaskDefinition",
          "ecs:DescribeTasks",
          "ecs:ListTasks",
          "ecs:DescribeClusters"
        ]
        Resource = "*"
      }
    ]
  })

  depends_on = [module.ecs]
}
