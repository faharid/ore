output "database_password_secret_arn" {
  value = aws_secretsmanager_secret.database_password.arn
}

output "database_password_secret_name" {
  value = aws_secretsmanager_secret.database_password.name
}

output "jwt_secret_arn" {
  value = aws_secretsmanager_secret.jwt_secret.arn
}

output "jwt_secret_name" {
  value = aws_secretsmanager_secret.jwt_secret.name
}

output "additional_secret_arns" {
  value = { for k, v in aws_secretsmanager_secret.additional : k => v.arn }
}

output "all_secret_arns" {
  value = concat(
    [aws_secretsmanager_secret.database_password.arn, aws_secretsmanager_secret.jwt_secret.arn],
    [for s in aws_secretsmanager_secret.additional : s.arn]
  )
}

output "vault_secret_paths" {
  description = "Documented Vault paths when Vault integration is enabled"
  value       = local.vault_secret_paths
}
