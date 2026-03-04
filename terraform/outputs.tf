output "s3_bucket_name" {
  description = "Name of the S3 bucket"
  value       = aws_s3_bucket.static_site.id
}

output "cloudfront_distribution_id" {
  description = "ID of the CloudFront distribution"
  value       = aws_cloudfront_distribution.main.id
}

output "cloudfront_domain_name" {
  description = "Domain name of the CloudFront distribution"
  value       = aws_cloudfront_distribution.main.domain_name
}

output "website_url" {
  description = "URL of the deployed website"
  value       = "https://${var.subdomain}.${var.domain_name}"
}

output "github_actions_role_arn" {
  description = "ARN of the IAM role assumed by GitHub Actions via OIDC — set this as the AWS_ROLE_ARN secret in the repository"
  value       = aws_iam_role.github_actions.arn
}

output "appregistry_application_id" {
  description = "ID of the AppRegistry application"
  value       = aws_servicecatalogappregistry_application.main.id
}
