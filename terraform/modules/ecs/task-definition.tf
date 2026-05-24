resource "aws_ecs_task_definition" "main" {
  family                   = "${local.name_prefix}-task"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.cpu
  memory                   = var.memory
  execution_role_arn       = var.task_execution_role_arn
  task_role_arn            = var.task_role_arn

  container_definitions = jsonencode([
    {
      name  = "app"
      image = var.container_image
      portMappings = [
        {
          containerPort = var.container_port
          hostPort      = var.container_port
          protocol      = "tcp"
        }
      ]
      essential = true
      environment = concat(
        [
          { name = "NODE_ENV", value = var.environment },
          { name = "DATABASE_HOST", value = var.database_host },
          { name = "DATABASE_PORT", value = tostring(var.database_port) },
          { name = "DATABASE_NAME", value = var.database_name },
          { name = "DATABASE_USER", value = var.database_username },
          { name = "PORT", value = tostring(var.container_port) }
        ],
        [for k, v in var.environment_variables : { name = k, value = v }]
      )
      secrets = [
        {
          name      = "DATABASE_PASSWORD"
          valueFrom = var.database_password_secret_arn
        },
        {
          name      = "JWT_SECRET"
          valueFrom = var.jwt_secret_arn
        }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.ecs.name
          awslogs-region        = var.aws_region
          awslogs-stream-prefix = "ecs"
        }
      }
      healthCheck = {
        command     = ["CMD-SHELL", "wget -q -O- http://localhost:${var.container_port}${var.health_check_path} || exit 1"]
        interval    = 30
        timeout     = 5
        retries     = 3
        startPeriod = 60
      }
    }
  ])

  tags = {
    Name = "${local.name_prefix}-task"
  }
}
