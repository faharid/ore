output "vpc_id" {
  value = module.vpc.vpc_id
}

output "alb_dns_name" {
  description = "Application Load Balancer DNS name"
  value       = module.alb.alb_dns_name
}

output "cloudfront_domain_name" {
  description = "CloudFront distribution domain (if enabled)"
  value       = try(module.cloudfront[0].domain_name, null)
}

output "rds_endpoint" {
  description = "RDS instance endpoint"
  value       = module.rds.endpoint
  sensitive   = true
}

output "rds_address" {
  value     = module.rds.address
  sensitive = true
}

output "ecs_cluster_name" {
  value = module.ecs.cluster_name
}

output "ecs_service_name" {
  value = module.ecs.service_name
}

output "ecr_repository_url" {
  value = module.ecs.ecr_repository_url
}

output "database_password_secret_arn" {
  value     = module.secrets.database_password_secret_arn
  sensitive = true
}

output "deployment_role_arn" {
  value = module.iam.deployment_role_arn
}

output "sns_alarm_topic_arn" {
  value = module.monitoring.sns_topic_arn
}

output "client_vpn_endpoint_dns" {
  value = try(module.client_vpn[0].client_vpn_endpoint_dns_name, null)
}

output "application_url" {
  description = "Primary URL to reach the application"
  value = coalesce(
    try("https://${var.cloudfront_aliases[0]}", null),
    try("https://${module.cloudfront[0].domain_name}", null),
    var.domain_name != "" ? "https://${var.domain_name}" : "http://${module.alb.alb_dns_name}"
  )
}
