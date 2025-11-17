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
