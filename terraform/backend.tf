terraform {
  # Bucket name is provided via backend.tfvars (not committed) to keep the
  # AWS account ID out of the public repository.
  # Init: terraform init -backend-config=backend.tfvars
  backend "s3" {
    key          = "terraform.tfstate"
    region       = "eu-west-1"
    encrypt      = true
    use_lockfile = true
  }
}
