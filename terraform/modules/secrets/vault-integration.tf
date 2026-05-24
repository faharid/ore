# Optional HashiCorp Vault integration.
# Enable with vault_enabled = true and configure a vault provider in the root module.
#
# Example (root providers.tf):
#   provider "vault" {
#     address = var.vault_address
#   }
#
# Then sync secrets from Vault into Secrets Manager using external processes
# or extend this file with vault_generic_secret data sources.

locals {
  vault_configured = var.vault_enabled && var.vault_address != ""
}

# Placeholder: documents expected Vault paths for ops teams
locals {
  vault_secret_paths = local.vault_configured ? {
    database = "secret/data/${var.project_name}/${var.environment}/database"
    jwt      = "secret/data/${var.project_name}/${var.environment}/jwt"
  } : {}
}
