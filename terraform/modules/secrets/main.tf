locals {
  name_prefix = "${var.project_name}-${var.environment}"
}

resource "random_password" "database" {
  count   = var.database_password == "" ? 1 : 0
  length  = 32
  special = true
}

resource "random_password" "jwt" {
  count   = var.jwt_secret == "" ? 1 : 0
  length  = 64
  special = false
}

locals {
  database_password_value = var.database_password != "" ? var.database_password : random_password.database[0].result
  jwt_secret_value        = var.jwt_secret != "" ? var.jwt_secret : random_password.jwt[0].result
}

resource "aws_secretsmanager_secret" "database_password" {
  name                    = "${local.name_prefix}/database-password"
  recovery_window_in_days = var.recovery_window_in_days

  tags = {
    Name = "${local.name_prefix}-database-password"
  }
}

resource "aws_secretsmanager_secret_version" "database_password" {
  secret_id     = aws_secretsmanager_secret.database_password.id
  secret_string = local.database_password_value
}

resource "aws_secretsmanager_secret" "jwt_secret" {
  name                    = "${local.name_prefix}/jwt-secret"
  recovery_window_in_days = var.recovery_window_in_days

  tags = {
    Name = "${local.name_prefix}-jwt-secret"
  }
}

resource "aws_secretsmanager_secret_version" "jwt_secret" {
  secret_id     = aws_secretsmanager_secret.jwt_secret.id
  secret_string = local.jwt_secret_value
}

resource "aws_secretsmanager_secret" "additional" {
  for_each = var.additional_secrets

  name                    = "${local.name_prefix}/${each.key}"
  recovery_window_in_days = var.recovery_window_in_days

  tags = {
    Name = "${local.name_prefix}-${each.key}"
  }
}

resource "aws_secretsmanager_secret_version" "additional" {
  for_each = var.additional_secrets

  secret_id     = aws_secretsmanager_secret.additional[each.key].id
  secret_string = each.value
}
