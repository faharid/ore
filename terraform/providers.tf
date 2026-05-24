provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}

# Datadog: use CloudWatch log subscription → Forwarder Lambda (see modules/monitoring).
# Configure datadog_forwarder_lambda_arn when the forwarder is deployed.
