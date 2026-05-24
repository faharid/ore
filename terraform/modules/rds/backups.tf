# Backup settings are applied on the RDS instance in main.tf.
# This file documents backup-related defaults for the module.

locals {
  backup_config = {
    retention_period = var.backup_retention_period
    window           = var.backup_window
    copy_tags        = true
  }
}
