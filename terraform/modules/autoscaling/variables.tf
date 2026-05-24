variable "cluster_name" {
  type = string
}

variable "service_name" {
  type = string
}

variable "min_capacity" {
  type    = number
  default = 1
}

variable "max_capacity" {
  type    = number
  default = 10
}

variable "scale_up_threshold" {
  type    = number
  default = 70
}

variable "scale_down_threshold" {
  type    = number
  default = 30
}

variable "scale_up_adjustment" {
  description = "Not used with target tracking; kept for README parity"
  type        = number
  default     = 2
}

variable "scale_down_adjustment" {
  type    = number
  default = -1
}
