output "autoscaling_target_resource_id" {
  value = aws_appautoscaling_target.ecs.resource_id
}

output "cpu_policy_arn" {
  value = aws_appautoscaling_policy.cpu_scale_up.arn
}
