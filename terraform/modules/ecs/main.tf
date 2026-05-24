locals {
  name_prefix    = "${var.project_name}-${var.environment}"
  cluster_name   = var.cluster_name != "" ? var.cluster_name : "${local.name_prefix}-cluster"
  service_name   = var.service_name != "" ? var.service_name : "${local.name_prefix}-service"
  log_group_name = var.log_group_name != "" ? var.log_group_name : "/ecs/${local.service_name}"
}

resource "aws_ecs_cluster" "main" {
  name = local.cluster_name

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  tags = {
    Name = local.cluster_name
  }
}

resource "aws_cloudwatch_log_group" "ecs" {
  name              = local.log_group_name
  retention_in_days = 30

  tags = {
    Name = local.log_group_name
  }
}

resource "aws_ecr_repository" "app" {
  count = var.create_ecr_repository ? 1 : 0

  name                 = "${local.name_prefix}-app"
  image_tag_mutability = "MUTABLE"
  force_delete         = var.environment != "prod"

  image_scanning_configuration {
    scan_on_push = true
  }

  encryption_configuration {
    encryption_type = "AES256"
  }

  tags = {
    Name = "${local.name_prefix}-app"
  }
}
