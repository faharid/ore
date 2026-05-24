variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "vpc_id" {
  type = string
}

variable "public_subnet_ids" {
  type = list(string)
}

variable "security_group_ids" {
  type = list(string)
}

variable "container_port" {
  type    = number
  default = 3001
}

variable "health_check_path" {
  type    = string
  default = "/api/health"
}

variable "health_check_interval" {
  type    = number
  default = 30
}

variable "domain_name" {
  description = "Domain for ACM certificate and HTTPS listener"
  type        = string
  default     = ""
}

variable "certificate_arn" {
  description = "Existing ACM certificate ARN (overrides domain_name creation)"
  type        = string
  default     = ""
}

variable "enable_https" {
  type    = bool
  default = true
}

variable "internal" {
  type    = bool
  default = false
}
