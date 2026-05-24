output "client_vpn_endpoint_id" {
  value = try(aws_ec2_client_vpn_endpoint.main[0].id, null)
}

output "client_vpn_endpoint_dns_name" {
  value = try(aws_ec2_client_vpn_endpoint.main[0].dns_name, null)
}
