variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "aws_region" {
  type = string
}

variable "private_subnet_ids" {
  type = list(string)
}

variable "security_group_ids" {
  type = list(string)
}

variable "target_group_arn" {
  type = string
}

variable "task_execution_role_arn" {
  type = string
}

variable "task_role_arn" {
  type = string
}

variable "cluster_name" {
  type    = string
  default = ""
}

variable "service_name" {
  type    = string
  default = ""
}

variable "container_image" {
  type = string
}

variable "container_port" {
  type    = number
  default = 3001
}

variable "cpu" {
  type    = number
  default = 512
}

variable "memory" {
  type    = number
  default = 1024
}

variable "desired_count" {
  type    = number
  default = 2
}

variable "database_host" {
  type = string
}

variable "database_port" {
  type    = number
  default = 5432
}

variable "database_name" {
  type = string
}

variable "database_username" {
  type = string
}

variable "database_password_secret_arn" {
  type = string
}

variable "jwt_secret_arn" {
  type = string
}

variable "environment_variables" {
  type    = map(string)
  default = {}
}

variable "log_group_name" {
  type    = string
  default = ""
}

variable "create_ecr_repository" {
  type    = bool
  default = true
}

variable "enable_ecs_exec" {
  type    = bool
  default = true
}

variable "health_check_grace_period" {
  type    = number
  default = 60
}

variable "health_check_path" {
  type    = string
  default = "/api/health"
}
