variable "project_name" {
  description = "Project name used for resource naming"
  type        = string
  default     = "ore"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "aws_account_id" {
  description = "AWS account ID (defaults to current caller)"
  type        = string
  default     = ""
}

variable "vpc_cidr" {
  type    = string
  default = "10.0.0.0/16"
}

variable "public_subnet_cidrs" {
  type    = list(string)
  default = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "private_subnet_cidrs" {
  type    = list(string)
  default = ["10.0.10.0/24", "10.0.11.0/24"]
}

variable "single_nat_gateway" {
  type    = bool
  default = false
}

variable "container_image" {
  description = "ECS container image URI"
  type        = string
  default     = "nginx:alpine"
}

variable "container_port" {
  type    = number
  default = 80
}

variable "health_check_path" {
  type    = string
  default = "/"
}

variable "ecs_cpu" {
  type    = number
  default = 512
}

variable "ecs_memory" {
  type    = number
  default = 1024
}

variable "ecs_desired_count" {
  type    = number
  default = 2
}

variable "ecs_min_capacity" {
  type    = number
  default = 1
}

variable "ecs_max_capacity" {
  type    = number
  default = 10
}

variable "ecs_scale_up_threshold" {
  type    = number
  default = 70
}

variable "ecs_scale_down_threshold" {
  type    = number
  default = 30
}

variable "rds_instance_class" {
  type    = string
  default = "db.t3.medium"
}

variable "rds_allocated_storage" {
  type    = number
  default = 100
}

variable "rds_multi_az" {
  type    = bool
  default = true
}

variable "rds_engine_version" {
  type    = string
  default = "15"
}

variable "rds_database_name" {
  type    = string
  default = "saasdb"
}

variable "rds_master_username" {
  type    = string
  default = "postgres"
}

variable "rds_backup_retention_period" {
  type    = number
  default = 30
}

variable "rds_deletion_protection" {
  type    = bool
  default = true
}

variable "rds_skip_final_snapshot" {
  type    = bool
  default = false
}

variable "domain_name" {
  type    = string
  default = ""
}

variable "certificate_arn" {
  type    = string
  default = ""
}

variable "enable_https" {
  type    = bool
  default = true
}

variable "enable_cloudfront" {
  type    = bool
  default = false
}

variable "enable_client_vpn" {
  type    = bool
  default = false
}

variable "client_vpn_certificate_arn" {
  type    = string
  default = ""
}

variable "enable_ssm_endpoints" {
  type    = bool
  default = true
}

variable "alarm_email" {
  type    = string
  default = ""
}

variable "datadog_api_key" {
  type      = string
  sensitive = true
  default   = ""
}

variable "datadog_app_key" {
  type      = string
  sensitive = true
  default   = ""
}

variable "datadog_api_url" {
  type    = string
  default = "https://api.datadoghq.com/"
}

variable "enable_datadog_forwarder" {
  type    = bool
  default = false
}

variable "datadog_forwarder_lambda_arn" {
  type    = string
  default = ""
}

variable "database_password" {
  type      = string
  sensitive = true
  default   = ""
}

variable "jwt_secret" {
  type      = string
  sensitive = true
  default   = ""
}

variable "additional_secrets" {
  description = "Map of secret path suffix to value (stored in Secrets Manager)"
  type        = map(string)
  default     = {}
}

variable "vault_address" {
  type    = string
  default = ""
}

variable "vault_enabled" {
  type    = bool
  default = false
}

variable "environment_variables" {
  type    = map(string)
  default = {}
}

variable "create_ecr_repository" {
  type    = bool
  default = true
}

variable "cloudfront_aliases" {
  type    = list(string)
  default = []
}

variable "cloudfront_acm_certificate_arn" {
  type    = string
  default = ""
}
