locals {
  name_prefix = "${var.project_name}-${var.environment}"
}

resource "aws_budgets_budget" "monthly" {
  name         = "${local.name_prefix}-monthly"
  budget_type  = "COST"
  limit_amount = var.limit_amount
  limit_unit   = "USD"
  time_unit    = "MONTHLY"

  dynamic "notification" {
    for_each = var.notification_email != "" || var.sns_topic_arn != "" ? [1] : []
    content {
      comparison_operator        = "GREATER_THAN"
      threshold                  = 80
      threshold_type             = "PERCENTAGE"
      notification_type          = "FORECASTED"
      subscriber_email_addresses = var.notification_email != "" ? [var.notification_email] : []
      subscriber_sns_topic_arns  = var.sns_topic_arn != "" ? [var.sns_topic_arn] : []
    }
  }

  dynamic "notification" {
    for_each = var.notification_email != "" || var.sns_topic_arn != "" ? [1] : []
    content {
      comparison_operator        = "GREATER_THAN"
      threshold                  = 100
      threshold_type             = "PERCENTAGE"
      notification_type          = "FORECASTED"
      subscriber_email_addresses = var.notification_email != "" ? [var.notification_email] : []
      subscriber_sns_topic_arns  = var.sns_topic_arn != "" ? [var.sns_topic_arn] : []
    }
  }
}
