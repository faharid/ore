# Contributing to ore

## Adding a module (e.g. ElastiCache)

1. Create `terraform/modules/elasticache/` with `main.tf`, `variables.tf`, `outputs.tf`
2. Wire in `terraform/main.tf` with `count = var.enable_elasticache ? 1 : 0`
3. Add variables to `terraform/variables.tf` with validation blocks
4. Document in `docs/DECISIONS.md` (new ADR)
5. Update environment tfvars examples

## Code style

- Run `terraform fmt -recursive` before commit
- Module names: lowercase, single purpose
- Resource names: `${local.name_prefix}-resource`
- Prefer variables over hardcoded ARNs

## Pre-commit

```bash
pip install pre-commit  # or brew install pre-commit
pre-commit install
pre-commit run --all-files
```

Hooks: fmt, validate, tflint (see [`.pre-commit-config.yaml`](../.pre-commit-config.yaml)).

## PR checklist

- [ ] `terraform validate` passes (bootstrap + root)
- [ ] `terraform fmt -check` passes
- [ ] New variables have descriptions and validation where appropriate
- [ ] Docs updated if behavior changes
- [ ] No secrets in committed files
- [ ] ADR added for significant architecture changes

## Testing

```bash
bash tests/terraform_validate.sh
```

## CI

Root pipelines: [`.github/workflows/terraform.yml`](../.github/workflows/terraform.yml), [`.gitlab-ci.yml`](../.gitlab-ci.yml).
