output "alb_arn" {
  value = aws_lb.main.arn
}

output "alb_arn_suffix" {
  value = aws_lb.main.arn_suffix
}

output "alb_dns_name" {
  value = aws_lb.main.dns_name
}

output "alb_zone_id" {
  value = aws_lb.main.zone_id
}

output "target_group_arn" {
  value = aws_lb_target_group.main.arn
}

output "target_group_name" {
  value = aws_lb_target_group.main.name
}

output "certificate_arn" {
  value = local.certificate_arn
}

output "https_listener_arn" {
  value = try(aws_lb_listener.https[0].arn, aws_lb_listener.http.arn)
}

output "http_listener_arn" {
  value = aws_lb_listener.http.arn
}
