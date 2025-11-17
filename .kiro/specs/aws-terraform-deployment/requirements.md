# Requirements Document

## Introduction

This document defines the requirements for deploying the Vintage Story Alloy Calculator web application to AWS using Terraform infrastructure as code. The deployment will utilize S3 for static hosting, CloudFront for content delivery, and ACM for SSL/TLS certificates. The infrastructure will be configured to support GitHub Actions CI/CD with AWS credentials stored as GitHub repository secrets.

## Glossary

- **Application**: The Vintage Story Alloy Calculator React/Vite web application
- **S3 Bucket**: AWS Simple Storage Service bucket for hosting static website files
- **CloudFront Distribution**: AWS content delivery network (CDN) for serving the Application globally
- **ACM Certificate**: AWS Certificate Manager SSL/TLS certificate for HTTPS
- **Route53**: AWS DNS service for domain management
- **GitHub Actions**: CI/CD automation platform for building and deploying the Application
- **Terraform**: Infrastructure as code tool for provisioning AWS resources
- **IAM User**: AWS Identity and Access Management user for deployment automation
- **GitHub Secrets**: Encrypted environment variables stored in GitHub repository settings

## Requirements

### Requirement 1

**User Story:** As a developer, I want to provision AWS infrastructure using Terraform, so that the deployment is reproducible and version-controlled

#### Acceptance Criteria

1. THE Terraform SHALL create an S3 Bucket configured for static website hosting
2. THE Terraform SHALL create a CloudFront Distribution that serves content from the S3 Bucket
3. THE Terraform SHALL create an ACM Certificate for the domain vs-calculator.tcousin.com
4. THE Terraform SHALL create Route53 DNS records pointing to the CloudFront Distribution
5. THE Terraform SHALL create an IAM User with minimal permissions required for GitHub Actions deployment

### Requirement 2

**User Story:** As a developer, I want the S3 bucket to host static website files, so that the Application is accessible via HTTP

#### Acceptance Criteria

1. THE S3 Bucket SHALL be configured with static website hosting enabled
2. THE S3 Bucket SHALL have index.html as the default document
3. THE S3 Bucket SHALL have index.html as the error document for SPA routing
4. THE S3 Bucket SHALL allow CloudFront Distribution to read objects via Origin Access Control
5. THE S3 Bucket SHALL block all public access except through CloudFront Distribution

### Requirement 3

**User Story:** As an end user, I want to access the Application over HTTPS, so that my connection is secure

#### Acceptance Criteria

1. THE CloudFront Distribution SHALL serve content exclusively over HTTPS
2. THE CloudFront Distribution SHALL redirect HTTP requests to HTTPS
3. THE ACM Certificate SHALL be valid for vs-calculator.tcousin.com
4. THE ACM Certificate SHALL be validated via DNS using Route53
5. THE CloudFront Distribution SHALL use the ACM Certificate for SSL/TLS termination

### Requirement 4

**User Story:** As an end user, I want fast page load times globally, so that the Application is responsive regardless of my location

#### Acceptance Criteria

1. THE CloudFront Distribution SHALL cache static assets with appropriate TTL values
2. THE CloudFront Distribution SHALL compress content using gzip and brotli
3. THE CloudFront Distribution SHALL use HTTP/2 and HTTP/3 protocols
4. THE CloudFront Distribution SHALL serve content from edge locations worldwide
5. THE CloudFront Distribution SHALL cache index.html with a short TTL to allow quick updates

### Requirement 5

**User Story:** As a developer, I want GitHub Actions to automatically deploy the Application, so that deployments are automated and consistent

#### Acceptance Criteria

1. THE IAM User SHALL have permissions to upload objects to the S3 Bucket
2. THE IAM User SHALL have permissions to invalidate CloudFront Distribution cache
3. THE IAM User SHALL NOT have permissions to modify infrastructure resources
4. THE Terraform SHALL output the IAM User access key ID
5. THE Terraform SHALL output the IAM User secret access key for initial GitHub Secrets configuration

### Requirement 6

**User Story:** As a developer, I want AWS credentials stored securely in GitHub, so that sensitive information is not exposed in the repository

#### Acceptance Criteria

1. THE deployment documentation SHALL instruct storing AWS_ACCESS_KEY_ID in GitHub Secrets
2. THE deployment documentation SHALL instruct storing AWS_SECRET_ACCESS_KEY in GitHub Secrets
3. THE Terraform configuration SHALL NOT contain hardcoded credentials
4. THE GitHub Actions workflow SHALL reference credentials from GitHub Secrets
5. THE IAM User credentials SHALL be rotatable without modifying Terraform code

### Requirement 7

**User Story:** As a developer, I want the domain vs-calculator.tcousin.com to resolve to the Application, so that users can access it via a friendly URL

#### Acceptance Criteria

1. THE Route53 SHALL have a hosted zone for tcousin.com domain
2. THE Route53 SHALL create an A record for vs-calculator.tcousin.com pointing to CloudFront Distribution
3. THE Route53 SHALL create an AAAA record for vs-calculator.tcousin.com pointing to CloudFront Distribution
4. THE CloudFront Distribution SHALL accept requests for vs-calculator.tcousin.com
5. THE CloudFront Distribution SHALL accept requests for www.vs-calculator.tcousin.com as an alternate domain

### Requirement 8

**User Story:** As a developer, I want proper SPA routing support, so that direct navigation to application routes works correctly

#### Acceptance Criteria

1. THE CloudFront Distribution SHALL return index.html for 404 errors with 200 status code
2. THE S3 Bucket SHALL serve index.html for all error responses
3. THE CloudFront Distribution SHALL preserve the URL path when serving index.html
4. THE Application SHALL handle client-side routing for all paths
5. THE CloudFront Distribution SHALL NOT cache 404 responses

### Requirement 9

**User Story:** As a developer, I want to invalidate CloudFront cache after deployments, so that users see the latest version immediately

#### Acceptance Criteria

1. THE GitHub Actions workflow SHALL create a CloudFront invalidation after uploading files
2. THE CloudFront invalidation SHALL target all paths (/*)
3. THE IAM User SHALL have cloudfront:CreateInvalidation permission
4. THE GitHub Actions workflow SHALL wait for invalidation completion before marking deployment successful
5. THE CloudFront invalidation SHALL complete within 5 minutes

### Requirement 10

**User Story:** As a developer, I want infrastructure costs to be minimal, so that hosting expenses are predictable and low

#### Acceptance Criteria

1. THE S3 Bucket SHALL use Standard storage class for cost efficiency
2. THE CloudFront Distribution SHALL use PriceClass_100 for North America and Europe only
3. THE S3 Bucket SHALL have lifecycle policies to delete old deployment artifacts after 30 days
4. THE CloudFront Distribution SHALL have logging disabled to reduce storage costs
5. THE Terraform SHALL output estimated monthly costs in comments

### Requirement 11

**User Story:** As a developer, I want all AWS resources tagged consistently, so that resources are organized and costs can be tracked by application

#### Acceptance Criteria

1. THE Terraform SHALL apply a common set of tags to all AWS resources
2. THE tags SHALL include an Application tag with value "vs-calculator"
3. THE tags SHALL include an Environment tag with value "production"
4. THE tags SHALL include a ManagedBy tag with value "terraform"
5. THE tags SHALL include a Project tag with value "vintage-story-calculator"

### Requirement 12

**User Story:** As a developer, I want resources grouped in an AWS Application, so that related resources are logically organized in the AWS console

#### Acceptance Criteria

1. THE Terraform SHALL create an AWS Service Catalog AppRegistry Application
2. THE Application SHALL have the name "vs-calculator"
3. THE Application SHALL have a description identifying it as the Vintage Story Alloy Calculator
4. THE Terraform SHALL associate all created resources with the Application
5. THE Application SHALL be tagged with the same common tags as other resources
