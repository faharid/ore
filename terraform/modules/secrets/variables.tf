variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "database_password" {
  description = "Database password (generated if empty)"
  type        = string
  sensitive   = true
  default     = ""
}

variable "jwt_secret" {
  description = "JWT signing secret (generated if empty)"
  type        = string
  sensitive   = true
  default     = ""
}

variable "additional_secrets" {
  description = "Map of secret name suffix to value"
  type        = map(string)
  default     = {}
}

variable "vault_address" {
  description = "HashiCorp Vault address for optional integration"
  type        = string
  default     = ""
}

variable "vault_enabled" {
  description = "Enable Vault data source lookups (requires vault provider)"
  type        = bool
  default     = false
}

variable "recovery_window_in_days" {
  type    = number
  default = 7
}
