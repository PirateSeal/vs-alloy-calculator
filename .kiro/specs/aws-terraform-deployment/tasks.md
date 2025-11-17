# Implementation Plan

- [x] 1. Set up Terraform project structure and provider configuration

  - Create terraform directory in project root
  - Write main.tf with AWS provider configuration (version ~> 6.0, region us-east-1)
  - Write variables.tf with all input variables (aws_region, domain_name, subdomain, project_name, environment, cloudfront_price_class)
  - Write outputs.tf with all output values (bucket name, CloudFront ID, website URL, IAM credentials)
  - Write locals.tf with common resource tags definition
  - Create terraform.tfvars.example file with sample values
  - Add .gitignore entries for Terraform files (_.tfstate, _.tfstate.backup, .terraform/, terraform.tfvars)
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 11.1, 11.2, 11.3, 11.4, 11.5_

- [x] 2. Implement S3 bucket for static website hosting

  - [x] 2.1 Create S3 bucket resource with random suffix

    - Write aws_s3_bucket resource with bucket name using random_id
    - Configure force_destroy = true for easier cleanup
    - Apply common tags from locals
    - _Requirements: 2.1, 11.1, 11.2, 11.3, 11.4, 11.5_

  - [x] 2.2 Configure S3 bucket settings

    - Write aws_s3_bucket_public_access_block resource to block all public access
    - Write aws_s3_bucket_website_configuration with index.html as index and error document
    - Write aws_s3_bucket_server_side_encryption_configuration with AES256

    - _Requirements: 2.2, 2.3, 2.5_

  - [x] 2.3 Create S3 bucket policy for CloudFront access

    - Write aws_s3_bucket_policy resource with CloudFront service principal

    - Use condition to restrict access to specific CloudFront distribution ARN
    - Add depends_on to ensure CloudFront distribution exists first
    - _Requirements: 2.4_

  - [x] 2.4 Add S3 lifecycle policy for old file cleanup
    - Write aws_s3_bucket_lifecycle_configuration resource
    - Configure expiration rule to delete objects after 30 days with prefix "old/"
    - _Requirements: 10.3_

- [x] 3. Implement CloudFront Origin Access Control

  - Write aws_cloudfront_origin_access_control resource
  - Configure name as "${var.project_name}-oac"
  - Set origin_access_control_origin_type = "s3"
  - Set signing_behavior = "always" and signing_protocol = "sigv4"
  - _Requirements: 2.4_

- [x] 4. Implement ACM certificate with DNS validation

  - [x] 4.1 Create ACM certificate resource

    - Write aws_acm_certificate resource in us-east-1 region
    - Set domain_name = "${var.subdomain}.${var.domain_name}"
    - Add subject_alternative_names = ["www.${var.subdomain}.${var.domain_name}"]
    - Set validation_method = "DNS"
    - Apply common tags
    - _Requirements: 3.1, 3.3, 3.4_

  - [x] 4.2 Create Route53 validation records

    - Write aws_route53_record resources for ACM validation
    - Use for_each to create records for each domain validation option
    - Set type = "CNAME" with validation record values

    - _Requirements: 3.4_

  - [x] 4.3 Wait for certificate validation
    - Write aws_acm_certificate_validation resource
    - Reference validation record FQDNs
    - Add timeouts for validation process
    - _Requirements: 3.4_

- [x] 5. Implement Route53 DNS records

  - [x] 5.1 Lookup existing Route53 hosted zone

    - Write data.aws_route53_zone resource to find tcousin.com zone
    - Add error handling comment if zone doesn't exist
    - _Requirements: 7.1_

  - [x] 5.2 Create A and AAAA records for subdomain

    - Write aws_route53_record for A record (IPv4) as alias to CloudFront
    - Write aws_route53_record for AAAA record (IPv6) as alias to CloudFront
    - Set zone_id from data source
    - Set name = "${var.subdomain}.${var.domain_name}"
    - Configure alias block with CloudFront domain and hosted zone ID (Z2FDTNDATAQYW2)
    - Set evaluate_target_health = false
    - _Requirements: 7.2, 7.3, 7.4_

- [x] 6. Implement CloudFront distribution

  - [x] 6.1 Configure CloudFront origin

    - Write aws_cloudfront_distribution resource
    - Configure origin block with S3 bucket regional domain name
    - Set origin_id = "S3-${aws_s3_bucket.static_site.id}"
    - Reference origin_access_control_id from OAC resource
    - _Requirements: 1.2_

  - [x] 6.2 Configure default cache behavior

    - Set allowed_methods = ["GET", "HEAD", "OPTIONS"]
    - Set cached_methods = ["GET", "HEAD"]
    - Set target_origin_id to S3 origin
    - Set viewer_protocol_policy = "redirect-to-https"
    - Set compress = true
    - Use managed cache policy ID: 658327ea-f89d-4fab-a63d-7e88639e58f6 (CachingOptimized)
    - Use managed response headers policy ID: 67f7725c-6f97-4210-82d7-5512b31e9d03 (SecurityHeadersPolicy)
    - _Requirements: 3.1, 3.2, 4.1, 4.2, 4.3_

  - [x] 6.3 Configure custom error responses for SPA routing

    - Add custom_error_response block for 404 errors returning /index.html with 200 status
    - Add custom_error_response block for 403 errors returning /index.html with 200 status
    - Set error_caching_min_ttl = 0 to prevent caching errors
    - _Requirements: 8.1, 8.2, 8.3, 8.5_

  - [x] 6.4 Configure distribution settings

    - Set enabled = true
    - Set is_ipv6_enabled = true
    - Set http_version = "http2and3"
    - Set price_class = var.cloudfront_price_class (default PriceClass_100)
    - Set default_root_object = "index.html"
    - Set aliases = ["${var.subdomain}.${var.domain_name}", "www.${var.subdomain}.${var.domain_name}"]
    - Set comment = "CloudFront distribution for ${var.project_name}"
    - Apply common tags
    - _Requirements: 3.5, 4.4, 7.4, 7.5, 10.2_

  - [x] 6.5 Configure SSL certificate

    - Set viewer_certificate.acm_certificate_arn from ACM certificate
    - Set viewer_certificate.ssl_support_method = "sni-only"
    - Set viewer_certificate.minimum_protocol_version = "TLSv1.2_2021"
    - _Requirements: 3.3, 3.5_

  - [x] 6.6 Configure geo restrictions
    - Add restrictions block with geo_restriction
    - Set restriction_type = "none" (no geographic restrictions)
    - _Requirements: 4.4_

- [x] 7. Implement IAM user for GitHub Actions

  - [x] 7.1 Create IAM user resource

    - Write aws_iam_user resource
    - Set name = "${var.project_name}-github-actions"
    - Set path = "/service-accounts/"
    - Apply common tags
    - _Requirements: 5.1, 5.2, 5.3_

  - [x] 7.2 Create IAM access key

    - Write aws_iam_access_key resource for the user
    - Output access key ID and secret (mark secret as sensitive)
    - _Requirements: 5.4, 5.5_

  - [x] 7.3 Create IAM policy for deployment permissions

    - Write aws_iam_user_policy resource with inline policy
    - Add S3 permissions: s3:PutObject, s3:GetObject, s3:DeleteObject, s3:ListBucket
    - Scope S3 permissions to specific bucket ARN and bucket ARN/\*
    - Add CloudFront permissions: cloudfront:CreateInvalidation, cloudfront:GetInvalidation
    - Scope CloudFront permissions to specific distribution ARN
    - _Requirements: 5.1, 5.2, 5.3, 9.1, 9.3_

- [x] 8. Implement AWS AppRegistry application

  - [x] 8.1 Create AppRegistry application

    - Write aws_servicecatalogappregistry_application resource
    - Set name = var.project_name
    - Set description = "Vintage Story Alloy Calculator - Static website deployment"
    - Apply common tags
    - _Requirements: 12.1, 12.2, 12.5_

  - [x] 8.2 Associate resources with application

    - Write aws_servicecatalogappregistry_resource_association for S3 bucket
    - Write aws_servicecatalogappregistry_resource_association for CloudFront distribution
    - Use resource ARNs for associations
    - _Requirements: 12.3, 12.4_

- [x] 9. Create GitHub Actions workflow file

  - [x] 9.1 Create workflow file structure

    - Create .github/workflows/deploy.yml file
    - Define workflow name as "Deploy to AWS"
    - Configure triggers: push to main branch and workflow_dispatch
    - Define environment variables for AWS_REGION, S3_BUCKET, CLOUDFRONT_DISTRIBUTION_ID
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [x] 9.2 Implement build job steps

    - Add checkout step using actions/checkout@v4
    - Add Node.js setup step using actions/setup-node@v4 with node-version 20
    - Add pnpm setup step using pnpm/action-setup@v4
    - Add install dependencies step: pnpm install
    - Add build step: pnpm run build:prod
    - _Requirements: 6.1, 6.2, 6.3_

  - [x] 9.3 Implement deployment steps
    - Add AWS credentials configuration step using aws-actions/configure-aws-credentials@v4
    - Reference AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY from secrets
    - Add S3 sync step: aws s3 sync dist/ s3://$S3_BUCKET --delete
    - Add CloudFront invalidation step: aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_DISTRIBUTION_ID --paths "/\*"
    - Add wait for invalidation step (optional)
    - _Requirements: 6.4, 9.1, 9.2, 9.4, 9.5_

- [x] 10. Create documentation files

  - [x] 10.1 Create Terraform README

    - Create terraform/README.md file
    - Document prerequisites (AWS account, Route53 hosted zone, Terraform installed)
    - Document initial setup steps (terraform init, plan, apply)
    - Document how to retrieve outputs for GitHub Secrets
    - Document variable customization options
    - Include cost estimation section
    - _Requirements: 6.1, 6.2, 6.5, 10.5_

  - [x] 10.2 Create deployment guide

    - Create DEPLOYMENT.md file in project root
    - Document GitHub Secrets configuration steps
    - Document first deployment process
    - Document how to verify deployment
    - Include troubleshooting section

    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [x] 10.3 Update main README
    - Add deployment section to existing README.md
    - Link to DEPLOYMENT.md for detailed instructions
    - Add badge for deployment status (optional)
    - Document the AWS architecture briefly
    - _Requirements: 6.1, 6.2_

- [ ] 11. Validate and test infrastructure

  - [ ] 11.1 Run Terraform validation

    - Execute terraform fmt to format all .tf files
    - Execute terraform validate to check syntax
    - Execute terraform plan to preview changes
    - Review plan output for correctness
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [ ]\* 11.2 Test infrastructure deployment

    - Execute terraform apply in test AWS account
    - Verify S3 bucket is created with correct configuration
    - Verify CloudFront distribution is deployed and enabled
    - Verify ACM certificate is validated
    - Verify Route53 records are created
    - Verify IAM user has correct permissions
    - Verify AppRegistry application is created with associations
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5, 5.1, 5.2, 5.3, 7.1, 7.2, 7.3, 7.4, 7.5, 11.1, 11.2, 11.3, 11.4, 11.5, 12.1, 12.2, 12.3, 12.4, 12.5_

  - [ ]\* 11.3 Test GitHub Actions workflow

    - Configure GitHub Secrets with Terraform outputs
    - Trigger workflow manually using workflow_dispatch
    - Monitor workflow execution for errors
    - Verify files are uploaded to S3
    - Verify CloudFront cache is invalidated
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 9.1, 9.2, 9.3, 9.4, 9.5_

  - [ ]\* 11.4 Test website functionality
    - Access website via https://vs-calculator.tcousin.com
    - Verify SSL certificate is valid and trusted
    - Test direct navigation to application routes (SPA routing)
    - Verify HTTP redirects to HTTPS
    - Test from multiple browsers
    - Verify mobile responsiveness
    - _Requirements: 3.1, 3.2, 3.3, 4.1, 4.2, 4.3, 4.4, 7.4, 7.5, 8.1, 8.2, 8.3, 8.4_
