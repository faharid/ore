variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "alarm_email" {
  type    = string
  default = ""
}

variable "ecs_cluster_name" {
  type = string
}

variable "ecs_service_name" {
  type = string
}

variable "alb_arn_suffix" {
  type    = string
  default = ""
}

variable "target_group_arn_suffix" {
  type    = string
  default = ""
}

variable "rds_instance_id" {
  type    = string
  default = ""
}

variable "log_group_name" {
  type = string
}

variable "log_retention_days" {
  type    = number
  default = 30
}

variable "datadog_api_key" {
  type      = string
  sensitive = true
  default   = ""
}

variable "cpu_alarm_threshold" {
  type    = number
  default = 80
}

variable "memory_alarm_threshold" {
  type    = number
  default = 85
}

variable "enable_datadog_forwarder" {
  type    = bool
  default = false
}

variable "datadog_forwarder_lambda_arn" {
  type    = string
  default = ""
}
