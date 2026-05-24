resource "terraform_data" "deployment_trust" {
  lifecycle {
    precondition {
      condition = (
        var.enable_local_assume_role ||
        (length(var.allowed_oidc_subjects) > 0 && (var.github_oidc_provider_arn != "" || var.gitlab_oidc_provider_arn != ""))
      )
      error_message = "Configure github_oidc_provider_arn or gitlab_oidc_provider_arn with allowed_oidc_subjects, or set enable_local_assume_role = true for dev."
    }
  }
}
