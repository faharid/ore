locals {
  name_prefix = "${var.project_name}-${var.environment}"
}

resource "aws_sns_topic" "alarms" {
  name = "${local.name_prefix}-alarms"
}

resource "aws_sns_topic_subscription" "alarm_email" {
  count = var.alarm_email != "" ? 1 : 0

  topic_arn = aws_sns_topic.alarms.arn
  protocol  = "email"
  endpoint  = var.alarm_email
}

# Datadog forwarder hook: subscription filter placeholder
# Deploy the official Datadog Forwarder Lambda separately, then set enable_datadog_forwarder = true
# and provide datadog_forwarder_lambda_arn via root module extension.

resource "aws_cloudwatch_log_subscription_filter" "datadog" {
  count = var.enable_datadog_forwarder && var.datadog_forwarder_lambda_arn != "" ? 1 : 0

  name            = "${local.name_prefix}-datadog"
  log_group_name  = var.log_group_name
  filter_pattern  = ""
  destination_arn = var.datadog_forwarder_lambda_arn
}
