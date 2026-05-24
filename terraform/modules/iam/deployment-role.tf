data "aws_iam_policy_document" "deployment_assume" {
  dynamic "statement" {
    for_each = var.github_oidc_provider_arn != "" ? [1] : []
    content {
      actions = ["sts:AssumeRoleWithWebIdentity"]
      principals {
        type        = "Federated"
        identifiers = [var.github_oidc_provider_arn]
      }
      condition {
        test     = "StringEquals"
        variable = "token.actions.githubusercontent.com:aud"
        values   = [var.github_oidc_audience]
      }
      condition {
        test     = "StringLike"
        variable = "token.actions.githubusercontent.com:sub"
        values   = var.allowed_oidc_subjects
      }
    }
  }

  dynamic "statement" {
    for_each = var.gitlab_oidc_provider_arn != "" ? [1] : []
    content {
      actions = ["sts:AssumeRoleWithWebIdentity"]
      principals {
        type        = "Federated"
        identifiers = [var.gitlab_oidc_provider_arn]
      }
      condition {
        test     = "StringEquals"
        variable = "gitlab.com:aud"
        values   = [var.gitlab_oidc_audience]
      }
      condition {
        test     = "StringLike"
        variable = "gitlab.com:sub"
        values   = var.allowed_oidc_subjects
      }
    }
  }

  dynamic "statement" {
    for_each = var.enable_local_assume_role ? [1] : []
    content {
      actions = ["sts:AssumeRole"]
      principals {
        type        = "AWS"
        identifiers = ["arn:aws:iam::${var.aws_account_id}:root"]
      }
      condition {
        test     = "Bool"
        variable = "aws:MultiFactorAuthPresent"
        values   = ["true"]
      }
    }
  }
}

resource "aws_iam_role" "deployment" {
  name               = "${local.name_prefix}-deployment"
  assume_role_policy = data.aws_iam_policy_document.deployment_assume.json
}

resource "aws_iam_role_policy" "deployment" {
  name = "${local.name_prefix}-deployment-policy"
  role = aws_iam_role.deployment.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = concat(
      [
        {
          Effect = "Allow"
          Action = [
            "ecr:GetAuthorizationToken"
          ]
          Resource = "*"
        }
      ],
      length(var.ecr_repository_arns) > 0 ? [
        {
          Effect = "Allow"
          Action = [
            "ecr:BatchCheckLayerAvailability",
            "ecr:GetDownloadUrlForLayer",
            "ecr:BatchGetImage",
            "ecr:PutImage",
            "ecr:InitiateLayerUpload",
            "ecr:UploadLayerPart",
            "ecr:CompleteLayerUpload"
          ]
          Resource = var.ecr_repository_arns
        }
      ] : [],
      var.ecs_cluster_arn != "" ? [
        {
          Effect = "Allow"
          Action = [
            "ecs:UpdateService",
            "ecs:DescribeServices",
            "ecs:DescribeTaskDefinition",
            "ecs:RegisterTaskDefinition",
            "ecs:DescribeTasks",
            "ecs:ListTasks",
            "ecs:DescribeClusters"
          ]
          Resource = "*"
        }
      ] : [],
      [
        {
          Effect = "Allow"
          Action = [
            "iam:PassRole"
          ]
          Resource = [
            aws_iam_role.ecs_task_execution.arn,
            aws_iam_role.ecs_task.arn
          ]
        }
      ]
    )
  })
}
