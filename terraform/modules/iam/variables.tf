variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "aws_region" {
  type = string
}

variable "aws_account_id" {
  type = string
}

variable "secrets_arns" {
  description = "Secrets Manager ARNs the ECS task may read"
  type        = list(string)
  default     = []
}

variable "ecr_repository_arns" {
  description = "ECR repository ARNs CI/CD may push to"
  type        = list(string)
  default     = []
}

variable "ecs_cluster_arn" {
  description = "ECS cluster ARN for deployment role"
  type        = string
  default     = ""
}

variable "ecs_service_arn" {
  description = "ECS service ARN for deployment role (informational)"
  type        = string
  default     = ""
}

variable "github_oidc_provider_arn" {
  type    = string
  default = ""
}

variable "gitlab_oidc_provider_arn" {
  type    = string
  default = ""
}

variable "github_oidc_audience" {
  type    = string
  default = "sts.amazonaws.com"
}

variable "gitlab_oidc_audience" {
  type    = string
  default = "https://gitlab.com"
}

variable "allowed_oidc_subjects" {
  description = "Allowed OIDC subject patterns (repo:org/repo:ref:refs/heads/main)"
  type        = list(string)
  default     = []
}

variable "enable_local_assume_role" {
  description = "Allow MFA-protected local assume role (dev only)"
  type        = bool
  default     = false
}
