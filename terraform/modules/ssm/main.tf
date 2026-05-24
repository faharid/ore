locals {
  name_prefix = "${var.project_name}-${var.environment}"
}

# SSM Session Manager: VPC interface endpoints for private subnet access without bastion
resource "aws_security_group" "ssm_endpoints" {
  count = var.enable_session_manager ? 1 : 0

  name        = "${local.name_prefix}-ssm-endpoints-sg"
  description = "Security group for SSM VPC interface endpoints"
  vpc_id      = var.vpc_id

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = [data.aws_vpc.selected.cidr_block]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${local.name_prefix}-ssm-endpoints-sg"
  }
}

data "aws_vpc" "selected" {
  id = var.vpc_id
}

locals {
  ssm_services = ["ssm", "ssmmessages", "ec2messages"]
}

resource "aws_vpc_endpoint" "ssm" {
  for_each = var.enable_session_manager ? toset(local.ssm_services) : toset([])

  vpc_id              = var.vpc_id
  service_name        = "com.amazonaws.${data.aws_region.current.name}.${each.key}"
  vpc_endpoint_type   = "Interface"
  subnet_ids          = var.private_subnet_ids
  security_group_ids  = [aws_security_group.ssm_endpoints[0].id]
  private_dns_enabled = true

  tags = {
    Name = "${local.name_prefix}-${each.key}-endpoint"
  }
}

data "aws_region" "current" {}

resource "aws_ssm_parameter" "rds_port_forward_doc" {
  count = var.enable_session_manager ? 1 : 0

  name        = "/${var.project_name}/${var.environment}/ssm/rds-access-note"
  description = "Use ECS Exec or SSM port forwarding to reach RDS in private subnets"
  type        = "String"
  value       = "RDS is in private subnets. Use: aws ecs execute-command or SSM port forwarding via a task with network access to SG ${var.rds_security_group_id}"

  tags = {
    Name = "${local.name_prefix}-rds-access-note"
  }
}
