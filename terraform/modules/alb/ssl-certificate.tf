resource "aws_acm_certificate" "main" {
  count = var.enable_https && var.domain_name != "" && var.certificate_arn == "" ? 1 : 0

  domain_name       = var.domain_name
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }

  tags = {
    Name = "${local.name_prefix}-cert"
  }
}

locals {
  certificate_arn = var.certificate_arn != "" ? var.certificate_arn : (
    var.enable_https && var.domain_name != "" ? try(aws_acm_certificate.main[0].arn, "") : ""
  )
}
