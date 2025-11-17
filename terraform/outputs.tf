# Note: These outputs reference resources that will be created in subsequent tasks
# They are defined here as part of the initial project structure setup

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

output "iam_user_name" {
  description = "Name of the IAM user for GitHub Actions"
  value       = aws_iam_user.github_actions.name
}

output "iam_access_key_id" {
  description = "Access key ID for GitHub Actions"
  value       = aws_iam_access_key.github_actions.id
}

output "iam_secret_access_key" {
  description = "Secret access key for GitHub Actions (sensitive)"
  value       = aws_iam_access_key.github_actions.secret
  sensitive   = true
}

output "appregistry_application_id" {
  description = "ID of the AppRegistry application"
  value       = aws_servicecatalogappregistry_application.main.id
}
