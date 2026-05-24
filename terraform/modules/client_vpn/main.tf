locals {
  name_prefix = "${var.project_name}-${var.environment}"
}

resource "aws_ec2_client_vpn_endpoint" "main" {
  count = var.enabled && var.server_certificate_arn != "" ? 1 : 0

  description            = "${local.name_prefix} Client VPN"
  server_certificate_arn = var.server_certificate_arn
  client_cidr_block      = var.client_cidr_block
  vpc_id                 = var.vpc_id
  security_group_ids     = var.security_group_ids
  split_tunnel           = true

  authentication_options {
    type                       = "certificate-authentication"
    root_certificate_chain_arn = var.server_certificate_arn
  }

  connection_log_options {
    enabled = true
  }

  dns_servers = var.dns_servers

  tags = {
    Name = "${local.name_prefix}-client-vpn"
  }
}

resource "aws_ec2_client_vpn_network_association" "main" {
  count = var.enabled && var.server_certificate_arn != "" ? length(var.private_subnet_ids) : 0

  client_vpn_endpoint_id = aws_ec2_client_vpn_endpoint.main[0].id
  subnet_id              = var.private_subnet_ids[count.index]
}

resource "aws_ec2_client_vpn_authorization_rule" "vpc" {
  count = var.enabled && var.server_certificate_arn != "" ? 1 : 0

  client_vpn_endpoint_id = aws_ec2_client_vpn_endpoint.main[0].id
  target_network_cidr    = var.vpc_cidr
  authorize_all_groups   = true
}
