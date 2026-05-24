data "aws_iam_policy_document" "deployment_assume" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }

  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "AWS"
      identifiers = ["arn:aws:iam::${var.aws_account_id}:root"]
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
      var.ecs_service_arn != "" ? [
        {
          Effect = "Allow"
          Action = [
            "ecs:UpdateService",
            "ecs:DescribeServices",
            "ecs:DescribeTaskDefinition",
            "ecs:RegisterTaskDefinition",
            "ecs:DescribeTasks",
            "ecs:ListTasks"
          ]
          Resource = compact([var.ecs_cluster_arn, var.ecs_service_arn, "*"])
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
