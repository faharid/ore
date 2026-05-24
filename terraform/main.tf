data "aws_caller_identity" "current" {}
data "aws_region" "current" {}

locals {
  account_id          = var.aws_account_id != "" ? var.aws_account_id : data.aws_caller_identity.current.account_id
  name_prefix         = "${var.project_name}-${var.environment}"
  ecr_repository_name = "${local.name_prefix}-app"
  ecr_repository_arn  = "arn:aws:ecr:${var.aws_region}:${local.account_id}:repository/${local.ecr_repository_name}"
  default_container_image = var.container_image != "nginx:alpine" ? var.container_image : (
    var.create_ecr_repository ? "${local.account_id}.dkr.ecr.${var.aws_region}.amazonaws.com/${local.ecr_repository_name}:latest" : var.container_image
  )
}

module "vpc" {
  source = "./modules/vpc"

  project_name         = var.project_name
  environment          = var.environment
  vpc_cidr             = var.vpc_cidr
  public_subnet_cidrs  = var.public_subnet_cidrs
  private_subnet_cidrs = var.private_subnet_cidrs
  single_nat_gateway   = var.single_nat_gateway
  container_port       = var.container_port
  enable_vpn_sg        = var.enable_client_vpn
  enable_flow_logs     = var.enable_vpc_flow_logs
}

module "secrets" {
  source = "./modules/secrets"

  project_name            = var.project_name
  environment             = var.environment
  database_password       = var.database_password
  jwt_secret              = var.jwt_secret
  additional_secrets      = var.additional_secrets
  vault_address           = var.vault_address
  vault_enabled           = var.vault_enabled
  recovery_window_in_days = var.environment == "prod" ? 30 : 7
}

module "iam" {
  source = "./modules/iam"

  project_name             = var.project_name
  environment              = var.environment
  aws_region               = var.aws_region
  aws_account_id           = local.account_id
  secrets_arns             = module.secrets.all_secret_arns
  ecr_repository_arns      = var.create_ecr_repository ? [local.ecr_repository_arn] : []
  github_oidc_provider_arn = var.github_oidc_provider_arn
  gitlab_oidc_provider_arn = var.gitlab_oidc_provider_arn
  allowed_oidc_subjects    = var.allowed_oidc_subjects
  enable_local_assume_role = var.enable_local_assume_role
}

data "aws_secretsmanager_secret_version" "db_password" {
  secret_id  = module.secrets.database_password_secret_arn
  depends_on = [module.secrets]
}

module "rds" {
  source = "./modules/rds"

  project_name            = var.project_name
  environment             = var.environment
  vpc_id                  = module.vpc.vpc_id
  private_subnet_ids      = module.vpc.private_subnet_ids
  security_group_ids      = [module.vpc.rds_security_group_id]
  database_name           = var.rds_database_name
  master_username         = var.rds_master_username
  master_password         = data.aws_secretsmanager_secret_version.db_password.secret_string
  instance_class          = var.rds_instance_class
  allocated_storage       = var.rds_allocated_storage
  engine_version          = var.rds_engine_version
  multi_az                = var.rds_multi_az
  backup_retention_period = var.rds_backup_retention_period
  deletion_protection     = var.rds_deletion_protection
  skip_final_snapshot     = var.rds_skip_final_snapshot
}

module "alb" {
  source = "./modules/alb"

  project_name       = var.project_name
  environment        = var.environment
  vpc_id             = module.vpc.vpc_id
  public_subnet_ids  = module.vpc.public_subnet_ids
  security_group_ids = [module.vpc.alb_security_group_id]
  container_port     = var.container_port
  health_check_path  = var.health_check_path
  domain_name        = var.domain_name
  certificate_arn    = var.certificate_arn
  enable_https       = var.enable_https
}

module "ecs" {
  source = "./modules/ecs"

  project_name                 = var.project_name
  environment                  = var.environment
  aws_region                   = var.aws_region
  private_subnet_ids           = module.vpc.private_subnet_ids
  security_group_ids           = [module.vpc.ecs_security_group_id]
  target_group_arn             = module.alb.target_group_arn
  task_execution_role_arn      = module.iam.ecs_task_execution_role_arn
  task_role_arn                = module.iam.ecs_task_role_arn
  container_image              = local.default_container_image
  container_port               = var.container_port
  cpu                          = var.ecs_cpu
  memory                       = var.ecs_memory
  desired_count                = var.ecs_desired_count
  database_host                = module.rds.address
  database_port                = module.rds.port
  database_name                = var.rds_database_name
  database_username            = var.rds_master_username
  database_password_secret_arn = module.secrets.database_password_secret_arn
  jwt_secret_arn               = module.secrets.jwt_secret_arn
  environment_variables        = var.environment_variables
  health_check_path            = var.health_check_path
  create_ecr_repository        = var.create_ecr_repository
  enable_ecs_exec              = var.enable_ecs_exec
}

module "autoscaling" {
  source = "./modules/autoscaling"

  cluster_name         = module.ecs.cluster_name
  service_name         = module.ecs.service_name
  min_capacity         = var.ecs_min_capacity
  max_capacity         = var.ecs_max_capacity
  scale_up_threshold   = var.ecs_scale_up_threshold
  scale_down_threshold = var.ecs_scale_down_threshold
}

module "monitoring" {
  source = "./modules/monitoring"

  project_name                 = var.project_name
  environment                  = var.environment
  alarm_email                  = var.alarm_email
  ecs_cluster_name             = module.ecs.cluster_name
  ecs_service_name             = module.ecs.service_name
  alb_arn_suffix               = module.alb.alb_arn_suffix
  rds_instance_id              = module.rds.db_instance_id
  log_group_name               = module.ecs.log_group_name
  datadog_api_key              = var.datadog_api_key
  enable_datadog_forwarder     = var.enable_datadog_forwarder
  datadog_forwarder_lambda_arn = var.datadog_forwarder_lambda_arn
}

module "cloudfront" {
  count  = var.enable_cloudfront ? 1 : 0
  source = "./modules/cloudfront"

  project_name           = var.project_name
  environment            = var.environment
  alb_dns_name           = module.alb.alb_dns_name
  aliases                = var.cloudfront_aliases
  acm_certificate_arn    = var.cloudfront_acm_certificate_arn
  origin_protocol_policy = module.alb.certificate_arn != "" ? "https-only" : "http-only"
}

module "ssm" {
  count  = var.enable_ssm_endpoints ? 1 : 0
  source = "./modules/ssm"

  project_name          = var.project_name
  environment           = var.environment
  vpc_id                = module.vpc.vpc_id
  private_subnet_ids    = module.vpc.private_subnet_ids
  rds_security_group_id = module.vpc.rds_security_group_id
}

module "client_vpn" {
  count  = var.enable_client_vpn && var.client_vpn_certificate_arn != "" ? 1 : 0
  source = "./modules/client_vpn"

  project_name           = var.project_name
  environment            = var.environment
  vpc_id                 = module.vpc.vpc_id
  vpc_cidr               = var.vpc_cidr
  private_subnet_ids     = module.vpc.private_subnet_ids
  server_certificate_arn = var.client_vpn_certificate_arn
  security_group_ids     = compact([module.vpc.vpn_security_group_id])
}

module "budgets" {
  count  = var.enable_budgets ? 1 : 0
  source = "./modules/budgets"

  project_name       = var.project_name
  environment        = var.environment
  limit_amount       = var.monthly_budget_limit
  notification_email = var.alarm_email
  sns_topic_arn      = module.monitoring.sns_topic_arn
}
