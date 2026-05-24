variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "vpc_id" {
  type = string
}

variable "vpc_cidr" {
  type = string
}

variable "private_subnet_ids" {
  type = list(string)
}

variable "server_certificate_arn" {
  description = "ACM ARN for Client VPN server certificate"
  type        = string
}

variable "client_cidr_block" {
  type    = string
  default = "10.100.0.0/22"
}

variable "dns_servers" {
  type    = list(string)
  default = ["10.0.0.2"]
}

variable "security_group_ids" {
  type    = list(string)
  default = []
}

variable "enabled" {
  type    = bool
  default = true
}
