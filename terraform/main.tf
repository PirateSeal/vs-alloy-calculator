terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.0"
    }
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = local.common_tags
  }
}

# Separate provider for us-east-1 (required for CloudFront ACM certificates)
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"

  default_tags {
    tags = local.common_tags
  }
}

# Random ID for unique S3 bucket name
resource "random_id" "bucket_suffix" {
  byte_length = 8
}

# S3 bucket for static website hosting
resource "aws_s3_bucket" "static_site" {
  bucket        = "${var.project_name}-static-site-${random_id.bucket_suffix.hex}"
  force_destroy = true

  tags = merge(
    local.common_tags,
    aws_servicecatalogappregistry_application.main.application_tag
  )
}

# Block all public access to S3 bucket
resource "aws_s3_bucket_public_access_block" "static_site" {
  bucket = aws_s3_bucket.static_site.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Configure S3 bucket for static website hosting
resource "aws_s3_bucket_website_configuration" "static_site" {
  bucket = aws_s3_bucket.static_site.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "index.html"
  }
}

# Enable server-side encryption for S3 bucket
resource "aws_s3_bucket_server_side_encryption_configuration" "static_site" {
  bucket = aws_s3_bucket.static_site.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# S3 bucket policy to allow CloudFront access
resource "aws_s3_bucket_policy" "static_site" {
  bucket = aws_s3_bucket.static_site.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowCloudFrontServicePrincipalReadOnly"
        Effect = "Allow"
        Principal = {
          Service = "cloudfront.amazonaws.com"
        }
        Action   = "s3:GetObject"
        Resource = "${aws_s3_bucket.static_site.arn}/*"
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = aws_cloudfront_distribution.main.arn
          }
        }
      }
    ]
  })

  depends_on = [
    aws_cloudfront_distribution.main,
    aws_s3_bucket_public_access_block.static_site
  ]
}

# S3 lifecycle policy to delete old deployment artifacts
resource "aws_s3_bucket_lifecycle_configuration" "static_site" {
  bucket = aws_s3_bucket.static_site.id

  rule {
    id     = "delete-old-files"
    status = "Enabled"

    filter {
      prefix = "old/"
    }

    expiration {
      days = 30
    }
  }
}

# CloudFront Origin Access Control for secure S3 access
resource "aws_cloudfront_origin_access_control" "main" {
  name                              = "${var.project_name}-oac"
  description                       = "Origin Access Control for ${var.project_name} S3 bucket"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# ACM Certificate for HTTPS (must be in us-east-1 for CloudFront)
resource "aws_acm_certificate" "main" {
  provider = aws.us_east_1

  domain_name               = "${var.subdomain}.${var.domain_name}"
  subject_alternative_names = ["www.${var.subdomain}.${var.domain_name}"]
  validation_method         = "DNS"

  tags = local.common_tags

  lifecycle {
    create_before_destroy = true
  }
}

# Lookup existing Route53 hosted zone
data "aws_route53_zone" "main" {
  name         = var.domain_name
  private_zone = false
}

# Route53 records for ACM certificate validation
resource "aws_route53_record" "cert_validation" {
  for_each = {
    for dvo in aws_acm_certificate.main.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = data.aws_route53_zone.main.zone_id
}

# Wait for ACM certificate validation to complete
resource "aws_acm_certificate_validation" "main" {
  provider = aws.us_east_1

  certificate_arn         = aws_acm_certificate.main.arn
  validation_record_fqdns = [for record in aws_route53_record.cert_validation : record.fqdn]

  timeouts {
    create = "10m"
  }
}

# CloudFront distribution for global content delivery
resource "aws_cloudfront_distribution" "main" {
  enabled             = true
  is_ipv6_enabled     = true
  http_version        = "http2and3"
  price_class         = var.cloudfront_price_class
  default_root_object = "index.html"
  aliases             = ["${var.subdomain}.${var.domain_name}", "www.${var.subdomain}.${var.domain_name}"]
  comment             = "CloudFront distribution for ${var.project_name}"

  depends_on = [aws_servicecatalogappregistry_application.main]

  origin {
    domain_name              = aws_s3_bucket.static_site.bucket_regional_domain_name
    origin_id                = "S3-${aws_s3_bucket.static_site.id}"
    origin_access_control_id = aws_cloudfront_origin_access_control.main.id
  }

  # Default cache behavior configuration
  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "S3-${aws_s3_bucket.static_site.id}"
    viewer_protocol_policy = "redirect-to-https"
    compress               = true

    # Use AWS managed cache policy for optimized caching
    cache_policy_id = "658327ea-f89d-4fab-a63d-7e88639e58f6" # Managed-CachingOptimized

    # Use AWS managed response headers policy for security headers
    response_headers_policy_id = "67f7725c-6f97-4210-82d7-5512b31e9d03" # Managed-SecurityHeadersPolicy
  }

  # Custom error responses for SPA routing support
  custom_error_response {
    error_code            = 404
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 0
  }

  custom_error_response {
    error_code            = 403
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 0
  }

  # Placeholder for restrictions - to be implemented in task 6.6
  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  # SSL certificate configuration
  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate_validation.main.certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  tags = merge(
    local.common_tags,
    aws_servicecatalogappregistry_application.main.application_tag
  )
}

# Route53 A record (IPv4) for subdomain pointing to CloudFront
resource "aws_route53_record" "main_a" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = "${var.subdomain}.${var.domain_name}"
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.main.domain_name
    zone_id                = aws_cloudfront_distribution.main.hosted_zone_id
    evaluate_target_health = false
  }
}

# Route53 AAAA record (IPv6) for subdomain pointing to CloudFront
resource "aws_route53_record" "main_aaaa" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = "${var.subdomain}.${var.domain_name}"
  type    = "AAAA"

  alias {
    name                   = aws_cloudfront_distribution.main.domain_name
    zone_id                = aws_cloudfront_distribution.main.hosted_zone_id
    evaluate_target_health = false
  }
}

# IAM user for GitHub Actions deployment
resource "aws_iam_user" "github_actions" {
  name = "${var.project_name}-github-actions"
  path = "/service-accounts/"

  tags = local.common_tags
}

# IAM access key for GitHub Actions
resource "aws_iam_access_key" "github_actions" {
  user = aws_iam_user.github_actions.name
}

# IAM policy for GitHub Actions deployment permissions
resource "aws_iam_user_policy" "github_actions" {
  name = "${var.project_name}-deployment-policy"
  user = aws_iam_user.github_actions.name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "S3BucketAccess"
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:GetObject",
          "s3:DeleteObject",
          "s3:ListBucket"
        ]
        Resource = [
          aws_s3_bucket.static_site.arn,
          "${aws_s3_bucket.static_site.arn}/*"
        ]
      },
      {
        Sid    = "CloudFrontInvalidation"
        Effect = "Allow"
        Action = [
          "cloudfront:CreateInvalidation",
          "cloudfront:GetInvalidation"
        ]
        Resource = aws_cloudfront_distribution.main.arn
      }
    ]
  })
}

# AWS Service Catalog AppRegistry Application for resource grouping
resource "aws_servicecatalogappregistry_application" "main" {
  name        = var.project_name
  description = "Vintage Story Alloy Calculator - Static website deployment"

  tags = local.common_tags
}

# Note: Resources are associated with the AppRegistry application through tags.
# The S3 bucket and CloudFront distribution already have the common_tags applied,
# which includes the Application tag that links them to the AppRegistry application.
# AWS automatically discovers and associates resources based on matching tags.
