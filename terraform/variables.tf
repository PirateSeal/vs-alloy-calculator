variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "eu-west-1"
}

variable "domain_name" {
  description = "Root domain name"
  type        = string
  default     = "tcousin.com"
}

variable "subdomain" {
  description = "Subdomain for the application"
  type        = string
  default     = "vs-calculator"
}

variable "project_name" {
  description = "Project identifier used in resource names"
  type        = string
  default     = "vs-calculator"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

variable "cloudfront_price_class" {
  description = "CloudFront price class (PriceClass_100, PriceClass_200, or PriceClass_All)"
  type        = string
  default     = "PriceClass_100"
}

variable "github_repo" {
  description = "GitHub repository in owner/name format, used to scope the OIDC trust policy"
  type        = string
  default     = "PirateSeal/vs-alloy-calculator"
}

variable "allow_bucket_force_destroy" {
  description = "Whether Terraform may delete the static-site S3 bucket even when it still contains objects. Keep false in production; set to true locally only when deliberately tearing the environment down."
  type        = bool
  default     = false
}
