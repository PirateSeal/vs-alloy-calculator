# Design Document

## Overview

This design document outlines the Terraform infrastructure for deploying the Vintage Story Alloy Calculator to AWS. The solution uses a modern static website hosting architecture with S3 for storage, CloudFront for global content delivery, ACM for SSL/TLS certificates, and Route53 for DNS management. The infrastructure is designed to be cost-effective, secure, and fully automated through GitHub Actions CI/CD.

## Architecture

### High-Level Architecture

```
┌─────────────┐
│   GitHub    │
│  Repository │
└──────┬──────┘
       │ (Push to main)
       ▼
┌─────────────┐
│   GitHub    │
│   Actions   │
└──────┬──────┘
       │ (Build & Deploy)
       ▼
┌─────────────┐      ┌──────────────┐
│  S3 Bucket  │◄─────┤  CloudFront  │
│   (Origin)  │      │ Distribution │
└─────────────┘      └──────┬───────┘
                            │
                     ┌──────▼───────┐
                     │  ACM Cert    │
                     │  (us-east-1) │
                     └──────────────┘
                            │
                     ┌──────▼───────┐
                     │   Route53    │
                     │  DNS Records │
                     └──────────────┘
                            │
                     ┌──────▼───────┐
                     │  End Users   │
                     └──────────────┘
```

### Component Interaction Flow

1. User requests `https://vs-calculator.tcousin.com`
2. Route53 resolves DNS to CloudFront distribution
3. CloudFront serves cached content or fetches from S3 origin
4. CloudFront uses ACM certificate for HTTPS termination
5. Content is delivered to user with optimal performance

### Deployment Flow

1. Developer pushes code to GitHub main branch
2. GitHub Actions workflow triggers
3. Workflow builds the Vite application
4. Built files are synced to S3 bucket
5. CloudFront cache is invalidated
6. New version is live within minutes

## Components and Interfaces

### 1. Terraform Provider Configuration

**Purpose**: Configure AWS provider and required Terraform settings

**Configuration**:
- AWS Provider version: ~> 6.0
- Terraform version: >= 1.0
- Region: us-east-1 (required for ACM certificates used with CloudFront)

**Variables**:
- `aws_region`: AWS region for resources (default: "us-east-1")
- `domain_name`: Root domain name (default: "tcousin.com")
- `subdomain`: Subdomain for the application (default: "vs-calculator")
- `project_name`: Project identifier (default: "vs-calculator")
- `environment`: Environment name (default: "production")

### 2. S3 Bucket for Static Hosting

**Resource**: `aws_s3_bucket`

**Purpose**: Store and serve static website files

**Configuration**:
- Bucket name: `vs-calculator-static-site-${random_id}`
- Versioning: Disabled (not needed for static sites)
- Public access: Blocked (access only through CloudFront)
- Encryption: AES256 server-side encryption
- Tags: Common resource tags

**Associated Resources**:
- `aws_s3_bucket_public_access_block`: Block all public access
- `aws_s3_bucket_website_configuration`: Configure index.html and error document
- `aws_s3_bucket_policy`: Allow CloudFront OAC to read objects
- `aws_s3_bucket_lifecycle_configuration`: Delete old deployment artifacts after 30 days

**Bucket Policy**:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowCloudFrontServicePrincipalReadOnly",
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudfront.amazonaws.com"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::bucket-name/*",
      "Condition": {
        "StringEquals": {
          "AWS:SourceArn": "arn:aws:cloudfront::account-id:distribution/distribution-id"
        }
      }
    }
  ]
}
```

### 3. CloudFront Origin Access Control (OAC)

**Resource**: `aws_cloudfront_origin_access_control`

**Purpose**: Secure access from CloudFront to S3 bucket

**Configuration**:
- Name: `${project_name}-oac`
- Origin type: s3
- Signing behavior: always
- Signing protocol: sigv4

**Why OAC over OAI**: OAC is the modern replacement for Origin Access Identity (OAI) and supports:
- All S3 buckets including those with SSE-KMS encryption
- HTTP and HTTPS requests
- Dynamic requests with POST/PUT/DELETE methods

### 4. ACM Certificate

**Resource**: `aws_acm_certificate`

**Purpose**: Provide SSL/TLS certificate for HTTPS

**Configuration**:
- Domain name: `vs-calculator.tcousin.com`
- Subject alternative names: `www.vs-calculator.tcousin.com`
- Validation method: DNS
- Region: us-east-1 (required for CloudFront)
- Tags: Common resource tags

**Associated Resources**:
- `aws_acm_certificate_validation`: Wait for DNS validation to complete

**Validation Process**:
1. ACM generates CNAME records for validation
2. Terraform creates Route53 records automatically
3. ACM validates domain ownership
4. Certificate becomes available for use

### 5. Route53 DNS Configuration

**Resources**:
- `data.aws_route53_zone`: Lookup existing hosted zone for tcousin.com
- `aws_route53_record` (validation): CNAME records for ACM validation
- `aws_route53_record` (A record): Alias to CloudFront distribution
- `aws_route53_record` (AAAA record): IPv6 alias to CloudFront distribution

**Configuration**:
- Zone name: tcousin.com
- A record: vs-calculator.tcousin.com → CloudFront distribution
- AAAA record: vs-calculator.tcousin.com → CloudFront distribution (IPv6)
- Alias records: Use CloudFront hosted zone ID (Z2FDTNDATAQYW2)

**Assumption**: The hosted zone for tcousin.com already exists in Route53

### 6. CloudFront Distribution

**Resource**: `aws_cloudfront_distribution`

**Purpose**: Global content delivery network for the application

**Origin Configuration**:
- Domain name: S3 bucket regional domain name
- Origin ID: `S3-${bucket_name}`
- Origin access control: OAC created above
- Origin path: Empty (serve from root)

**Default Cache Behavior**:
- Allowed methods: GET, HEAD, OPTIONS
- Cached methods: GET, HEAD
- Viewer protocol policy: redirect-to-https
- Compress: true (gzip and brotli)
- Cache policy: Managed-CachingOptimized (ID: 658327ea-f89d-4fab-a63d-7e88639e58f6)
- Response headers policy: Managed-SecurityHeadersPolicy (ID: 67f7725c-6f97-4210-82d7-5512b31e9d03)

**Custom Error Responses**:
- 404 errors: Return /index.html with 200 status (SPA routing support)
- 403 errors: Return /index.html with 200 status (SPA routing support)

**Distribution Settings**:
- Enabled: true
- IPv6: Enabled
- HTTP version: http2and3
- Price class: PriceClass_100 (North America and Europe)
- Default root object: index.html
- Aliases: vs-calculator.tcousin.com, www.vs-calculator.tcousin.com
- SSL certificate: ACM certificate ARN
- SSL support method: sni-only
- Minimum protocol version: TLSv1.2_2021

**Tags**: Common resource tags

### 7. IAM User for GitHub Actions

**Resource**: `aws_iam_user`

**Purpose**: Provide credentials for automated deployments

**Configuration**:
- Username: `${project_name}-github-actions`
- Path: /service-accounts/
- Tags: Common resource tags

**Associated Resources**:
- `aws_iam_access_key`: Generate access key and secret
- `aws_iam_user_policy`: Inline policy with minimal permissions

**IAM Policy**:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "S3BucketAccess",
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::bucket-name",
        "arn:aws:s3:::bucket-name/*"
      ]
    },
    {
      "Sid": "CloudFrontInvalidation",
      "Effect": "Allow",
      "Action": [
        "cloudfront:CreateInvalidation",
        "cloudfront:GetInvalidation"
      ],
      "Resource": "arn:aws:cloudfront::account-id:distribution/distribution-id"
    }
  ]
}
```

**Security Considerations**:
- Principle of least privilege: Only permissions needed for deployment
- No permissions to modify infrastructure
- Credentials should be rotated periodically
- Access key stored as sensitive output

### 8. AWS Service Catalog AppRegistry Application

**Resource**: `aws_servicecatalogappregistry_application`

**Purpose**: Logical grouping of related AWS resources

**Configuration**:
- Name: `vs-calculator`
- Description: "Vintage Story Alloy Calculator - Static website deployment"
- Tags: Common resource tags

**Associated Resources**:
- `aws_servicecatalogappregistry_resource_association`: Associate S3 bucket
- `aws_servicecatalogappregistry_resource_association`: Associate CloudFront distribution

**Benefits**:
- Centralized view of all application resources in AWS Console
- Cost tracking and allocation by application
- Resource lifecycle management
- Compliance and governance

### 9. Common Resource Tags

**Purpose**: Consistent tagging across all resources

**Tags**:
- `Application`: "vs-calculator"
- `Environment`: "production"
- `ManagedBy`: "terraform"
- `Project`: "vintage-story-calculator"
- `Repository`: "https://github.com/[username]/vs-alloy-calculator"

**Implementation**: Use `locals` block to define tags once and reference throughout

## Data Models

### Terraform Variables

```hcl
variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-east-1"
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
  description = "CloudFront price class"
  type        = string
  default     = "PriceClass_100"
}
```

### Terraform Outputs

```hcl
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
```

### GitHub Actions Workflow Structure

```yaml
name: Deploy to AWS
on:
  push:
    branches: [main]
  workflow_dispatch:

env:
  AWS_REGION: us-east-1
  S3_BUCKET: ${{ secrets.S3_BUCKET_NAME }}
  CLOUDFRONT_DISTRIBUTION_ID: ${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }}

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
      - name: Setup Node.js
      - name: Install dependencies
      - name: Build application
      - name: Configure AWS credentials
      - name: Sync to S3
      - name: Invalidate CloudFront cache
```

## Error Handling

### S3 Bucket Errors

**Scenario**: Bucket name already exists
- **Mitigation**: Use random suffix in bucket name
- **Implementation**: `random_id` resource with 8-byte hex suffix

**Scenario**: Bucket policy conflicts
- **Mitigation**: Ensure CloudFront distribution is created before bucket policy
- **Implementation**: Use `depends_on` in bucket policy resource

### CloudFront Distribution Errors

**Scenario**: Certificate not validated
- **Mitigation**: Wait for ACM certificate validation before creating distribution
- **Implementation**: Use `aws_acm_certificate_validation` resource

**Scenario**: Distribution deployment takes too long
- **Mitigation**: Set `wait_for_deployment = false` for faster Terraform applies
- **Implementation**: Distribution will continue deploying in background

### Route53 Errors

**Scenario**: Hosted zone doesn't exist
- **Mitigation**: Document prerequisite that hosted zone must exist
- **Implementation**: Use data source with error handling

**Scenario**: DNS propagation delays
- **Mitigation**: Document that DNS changes can take up to 48 hours
- **Implementation**: No code changes needed, documentation only

### IAM Errors

**Scenario**: Access key limit reached (2 per user)
- **Mitigation**: Delete old access keys before creating new ones
- **Implementation**: Manual process, documented in README

**Scenario**: Insufficient permissions
- **Mitigation**: Ensure Terraform execution role has required permissions
- **Implementation**: Document required permissions in README

### GitHub Actions Errors

**Scenario**: AWS credentials not configured
- **Mitigation**: Validate secrets exist before deployment
- **Implementation**: Add validation step in workflow

**Scenario**: Build fails
- **Mitigation**: Run build locally before pushing
- **Implementation**: Add pre-commit hooks (optional)

**Scenario**: S3 sync fails
- **Mitigation**: Retry logic in workflow
- **Implementation**: Use `aws s3 sync` with `--retry-mode adaptive`

**Scenario**: CloudFront invalidation fails
- **Mitigation**: Continue deployment even if invalidation fails
- **Implementation**: Use `|| true` to prevent workflow failure

## Testing Strategy

### Infrastructure Testing

**Unit Tests**: Not applicable for Terraform (declarative)

**Validation Tests**:
1. `terraform fmt -check`: Verify code formatting
2. `terraform validate`: Verify syntax and configuration
3. `terraform plan`: Verify planned changes before apply

**Integration Tests**:
1. Apply infrastructure to test AWS account
2. Verify S3 bucket is created and configured
3. Verify CloudFront distribution is deployed
4. Verify ACM certificate is validated
5. Verify Route53 records are created
6. Verify IAM user has correct permissions

### Application Deployment Testing

**Pre-Deployment Tests**:
1. Run `npm run build:prod` locally
2. Verify build output in `dist/` directory
3. Check for build errors or warnings

**Post-Deployment Tests**:
1. Access website via HTTPS URL
2. Verify SSL certificate is valid
3. Test SPA routing (direct navigation to routes)
4. Verify CloudFront caching headers
5. Test from multiple geographic locations
6. Verify mobile responsiveness

**Automated Tests** (Optional):
1. Lighthouse CI for performance metrics
2. Broken link checker
3. Security headers validation
4. SSL certificate expiration monitoring

### Rollback Strategy

**Infrastructure Rollback**:
1. Use Terraform state to revert to previous version
2. Run `terraform apply` with previous configuration
3. CloudFront distribution will update automatically

**Application Rollback**:
1. Identify previous working version in Git
2. Checkout previous commit
3. Trigger GitHub Actions workflow
4. New deployment will overwrite current version

**Emergency Rollback**:
1. Manually upload previous `dist/` files to S3
2. Invalidate CloudFront cache
3. Website will revert within minutes

## Security Considerations

### S3 Bucket Security

- Block all public access
- Access only through CloudFront OAC
- Enable server-side encryption (AES256)
- No versioning (reduces costs, not needed for static sites)
- Lifecycle policy to delete old files

### CloudFront Security

- HTTPS only (redirect HTTP to HTTPS)
- TLS 1.2 minimum protocol version
- Security headers policy applied
- Origin access restricted to CloudFront
- No logging (reduces costs and data exposure)

### IAM Security

- Principle of least privilege
- Service account path: /service-accounts/
- No console access
- Programmatic access only
- Credentials stored as GitHub Secrets

### DNS Security

- DNSSEC not enabled (optional enhancement)
- Alias records (not CNAME) for apex domain support
- IPv6 support enabled

### GitHub Actions Security

- Secrets stored encrypted in GitHub
- No secrets in code or logs
- AWS credentials scoped to specific resources
- Workflow only triggers on main branch

## Cost Estimation

### Monthly Costs (Estimated)

**S3 Storage**:
- Storage: ~2 MB (application files)
- Cost: $0.00 (under free tier)

**S3 Requests**:
- PUT requests: ~100/month (deployments)
- GET requests: 0 (served by CloudFront)
- Cost: $0.00 (under free tier)

**CloudFront**:
- Data transfer: ~10 GB/month (estimated)
- Requests: ~100,000/month (estimated)
- Cost: ~$1.00/month (PriceClass_100)

**Route53**:
- Hosted zone: $0.50/month
- Queries: ~100,000/month
- Cost: ~$0.90/month

**ACM Certificate**:
- Cost: $0.00 (free for public certificates)

**IAM User**:
- Cost: $0.00 (no charge for IAM users)

**Total Estimated Cost**: ~$2.40/month

**Cost Optimization**:
- Use PriceClass_100 (North America and Europe only)
- No CloudFront logging
- No S3 versioning
- Lifecycle policy to delete old files
- Aggressive caching to reduce origin requests

## Deployment Instructions

### Prerequisites

1. AWS account with appropriate permissions
2. Route53 hosted zone for tcousin.com
3. Terraform installed (>= 1.0)
4. AWS CLI configured with credentials
5. GitHub repository for the application

### Initial Infrastructure Deployment

1. Clone repository
2. Navigate to terraform directory
3. Initialize Terraform: `terraform init`
4. Review plan: `terraform plan`
5. Apply infrastructure: `terraform apply`
6. Save outputs: `terraform output -json > outputs.json`

### GitHub Secrets Configuration

1. Navigate to GitHub repository settings
2. Add secrets:
   - `AWS_ACCESS_KEY_ID`: From Terraform output
   - `AWS_SECRET_ACCESS_KEY`: From Terraform output (sensitive)
   - `S3_BUCKET_NAME`: From Terraform output
   - `CLOUDFRONT_DISTRIBUTION_ID`: From Terraform output
   - `AWS_REGION`: us-east-1

### First Deployment

1. Push code to main branch
2. GitHub Actions workflow triggers automatically
3. Monitor workflow execution
4. Verify deployment at https://vs-calculator.tcousin.com

### Subsequent Deployments

1. Make code changes
2. Commit and push to main branch
3. Automatic deployment via GitHub Actions
4. Changes live within 5-10 minutes

## Maintenance and Operations

### Regular Maintenance

- Monitor AWS costs monthly
- Review CloudFront access logs (if enabled)
- Rotate IAM access keys every 90 days
- Update Terraform provider versions quarterly
- Review and update security policies

### Monitoring

- CloudWatch alarms for CloudFront errors (optional)
- Route53 health checks (optional)
- SSL certificate expiration monitoring (ACM handles renewal)
- GitHub Actions workflow notifications

### Disaster Recovery

- Terraform state stored in S3 backend (recommended)
- Infrastructure can be recreated from code
- Application code in Git repository
- RTO: ~30 minutes (time to run terraform apply)
- RPO: 0 (no data loss, static site)

## Future Enhancements

### Optional Improvements

1. **CloudFront Functions**: Add security headers, URL rewrites
2. **WAF Integration**: Add web application firewall for DDoS protection
3. **CloudWatch Dashboards**: Centralized monitoring
4. **Terraform Remote State**: Store state in S3 with DynamoDB locking
5. **Multi-Environment**: Add staging environment
6. **Blue-Green Deployments**: Use CloudFront continuous deployment
7. **Custom Error Pages**: Branded 404 and 500 error pages
8. **Performance Monitoring**: Real User Monitoring (RUM)
9. **Cost Alerts**: CloudWatch billing alarms
10. **Automated Testing**: Integration tests in CI/CD pipeline
