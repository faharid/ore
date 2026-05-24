variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "vpc_cidr" {
  type    = string
  default = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "List of AZs to use (defaults to first 2 in region)"
  type        = list(string)
  default     = []
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
  description = "Use a single NAT gateway to reduce cost (recommended for dev)"
  type        = bool
  default     = false
}

variable "enable_dns_hostnames" {
  type    = bool
  default = true
}

variable "enable_dns_support" {
  type    = bool
  default = true
}

variable "container_port" {
  type    = number
  default = 3001
}

variable "enable_vpn_sg" {
  description = "Create security group for Client VPN"
  type        = bool
  default     = false
}

variable "enable_flow_logs" {
  type    = bool
  default = false
}
