variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "limit_amount" {
  type    = string
  default = "200"
}

variable "notification_email" {
  type    = string
  default = ""
}

variable "sns_topic_arn" {
  type    = string
  default = ""
}
