output "ssm_endpoint_ids" {
  value = [for ep in aws_vpc_endpoint.ssm : ep.id]
}

output "ssm_endpoints_security_group_id" {
  value = try(aws_security_group.ssm_endpoints[0].id, null)
}
