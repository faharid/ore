output "vpc_id" {
  description = "VPC ID — use for peering or VPN attachments"
  value       = module.vpc.vpc_id
}

output "alb_dns_name" {
  description = "ALB DNS name — curl http://ALB_DNS/health or CNAME custom domain here"
  value       = module.alb.alb_dns_name
}

output "cloudfront_domain_name" {
  description = "CloudFront distribution domain when enable_cloudfront=true"
  value       = try(module.cloudfront[0].domain_name, null)
}

output "rds_endpoint" {
  description = "RDS host:port — sensitive; apps use Secrets Manager + DATABASE_HOST env"
  value       = module.rds.endpoint
  sensitive   = true
}

output "rds_address" {
  description = "RDS hostname only"
  value       = module.rds.address
  sensitive   = true
}

output "ecs_cluster_name" {
  description = "ECS cluster — set ECS_CLUSTER in CI deploy scripts"
  value       = module.ecs.cluster_name
}

output "ecs_service_name" {
  description = "ECS service — set ECS_SERVICE in CI deploy scripts"
  value       = module.ecs.service_name
}

output "ecr_repository_url" {
  description = "ECR URL for docker push (no tag suffix)"
  value       = module.ecs.ecr_repository_url
}

output "database_password_secret_arn" {
  description = "Secrets Manager ARN for DB password"
  value       = module.secrets.database_password_secret_arn
  sensitive   = true
}

output "deployment_role_arn" {
  description = "CI/CD role ARN — configure GitHub OIDC secret AWS_DEPLOY_ROLE_ARN"
  value       = module.iam.deployment_role_arn
}

output "sns_alarm_topic_arn" {
  description = "SNS topic for CloudWatch alarms — confirm email subscription"
  value       = module.monitoring.sns_topic_arn
}

output "client_vpn_endpoint_dns" {
  description = "Client VPN endpoint DNS when enabled"
  value       = try(module.client_vpn[0].client_vpn_endpoint_dns_name, null)
}

output "application_url" {
  description = "Best URL to reach the app (CloudFront > domain > ALB HTTP)"
  value = coalesce(
    try("https://${var.cloudfront_aliases[0]}", null),
    try("https://${module.cloudfront[0].domain_name}", null),
    var.domain_name != "" ? "https://${var.domain_name}" : "http://${module.alb.alb_dns_name}"
  )
}

output "budget_id" {
  description = "AWS Budgets ID when enable_budgets=true"
  value       = try(module.budgets[0].budget_id, null)
}
