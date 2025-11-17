# Terraform Infrastructure for Vintage Story Alloy Calculator

This directory contains Terraform configuration for deploying the Vintage Story Alloy Calculator to AWS using a modern static website hosting architecture.

## Architecture Overview

The infrastructure consists of:

- **S3 Bucket**: Stores static website files
- **CloudFront Distribution**: Global CDN for content delivery
- **ACM Certificate**: SSL/TLS certificate for HTTPS
- **Route53 DNS**: DNS records for custom domain
- **IAM User**: Service account for GitHub Actions deployments
- **AppRegistry Application**: Logical grouping of resources

## Prerequisites

Before deploying this infrastructure, ensure you have:

1. **AWS Account**: An active AWS account with appropriate permissions
2. **Route53 Hosted Zone**: A hosted zone for `tcousin.com` must already exist in Route53
3. **Terraform**: Terraform CLI installed (version >= 1.0)
   - Download from: https://www.terraform.io/downloads
4. **AWS CLI**: AWS CLI configured with credentials
   - Install: https://aws.amazon.com/cli/
   - Configure: `aws configure`
5. **Permissions**: Your AWS credentials must have permissions to create:
   - S3 buckets and policies
   - CloudFront distributions
   - ACM certificates
   - Route53 records
   - IAM users and policies
   - AppRegistry applications

## Initial Setup

### 1. Initialize Terraform

Navigate to the terraform directory and initialize:

```bash
cd terraform
terraform init
```

This will download the required AWS provider plugins.

### 2. Review Variables

The configuration uses the following default variables (defined in `variables.tf`):

- `aws_region`: "us-east-1" (required for CloudFront ACM certificates)
- `domain_name`: "tcousin.com"
- `subdomain`: "vs-calculator"
- `project_name`: "vs-calculator"
- `environment`: "production"
- `cloudfront_price_class`: "PriceClass_100" (North America and Europe)

### 3. Customize Variables (Optional)

To customize variables, create a `terraform.tfvars` file:

```bash
cp terraform.tfvars.example terraform.tfvars
```

Edit `terraform.tfvars` with your values:

```hcl
aws_region            = "us-east-1"
domain_name           = "tcousin.com"
subdomain             = "vs-calculator"
project_name          = "vs-calculator"
environment           = "production"
cloudfront_price_class = "PriceClass_100"
```

**Note**: The `terraform.tfvars` file is gitignored to prevent committing sensitive values.

### 4. Preview Changes

Review the infrastructure that will be created:

```bash
terraform plan
```

This shows all resources that Terraform will create without making any changes.

### 5. Deploy Infrastructure

Apply the configuration to create resources:

```bash
terraform apply
```

Type `yes` when prompted to confirm. The deployment takes approximately 15-20 minutes due to:
- CloudFront distribution deployment (~10-15 minutes)
- ACM certificate DNS validation (~5 minutes)

## Retrieving Outputs for GitHub Secrets

After successful deployment, retrieve the outputs needed for GitHub Actions:

### View All Outputs

```bash
terraform output
```

### Retrieve Specific Values

```bash
# S3 Bucket Name
terraform output s3_bucket_name

# CloudFront Distribution ID
terraform output cloudfront_distribution_id

# IAM Access Key ID
terraform output iam_access_key_id

# IAM Secret Access Key (sensitive)
terraform output -raw iam_secret_access_key
```

### Save Outputs to File

```bash
terraform output -json > outputs.json
```

**Important**: The `iam_secret_access_key` is marked as sensitive and will only display when explicitly requested.

## Configuring GitHub Secrets

Use the Terraform outputs to configure GitHub repository secrets:

1. Navigate to your GitHub repository
2. Go to Settings → Secrets and variables → Actions
3. Add the following secrets:

| Secret Name | Terraform Output | Command |
|------------|------------------|---------|
| `AWS_ACCESS_KEY_ID` | `iam_access_key_id` | `terraform output iam_access_key_id` |
| `AWS_SECRET_ACCESS_KEY` | `iam_secret_access_key` | `terraform output -raw iam_secret_access_key` |
| `S3_BUCKET_NAME` | `s3_bucket_name` | `terraform output s3_bucket_name` |
| `CLOUDFRONT_DISTRIBUTION_ID` | `cloudfront_distribution_id` | `terraform output cloudfront_distribution_id` |
| `AWS_REGION` | (manual) | `us-east-1` |

## Variable Customization Options

### AWS Region

```hcl
aws_region = "us-east-1"  # Must be us-east-1 for CloudFront ACM certificates
```

**Note**: ACM certificates used with CloudFront must be created in us-east-1 region.

### Domain Configuration

```hcl
domain_name = "tcousin.com"      # Your root domain
subdomain   = "vs-calculator"     # Subdomain for the application
```

The application will be accessible at: `https://{subdomain}.{domain_name}`

### Project Naming

```hcl
project_name = "vs-calculator"    # Used in resource names and tags
environment  = "production"       # Environment identifier
```

### CloudFront Price Class

```hcl
cloudfront_price_class = "PriceClass_100"  # North America and Europe only
```

Available options:
- `PriceClass_100`: North America and Europe (lowest cost)
- `PriceClass_200`: North America, Europe, Asia, Middle East, and Africa
- `PriceClass_All`: All edge locations (highest cost)

## Cost Estimation

### Monthly Cost Breakdown

Based on typical usage for a small static website:

| Service | Usage | Estimated Cost |
|---------|-------|----------------|
| **S3 Storage** | ~2 MB | $0.00 (free tier) |
| **S3 Requests** | ~100 PUT/month | $0.00 (free tier) |
| **CloudFront Data Transfer** | ~10 GB/month | ~$0.85 |
| **CloudFront Requests** | ~100,000/month | ~$0.10 |
| **Route53 Hosted Zone** | 1 zone | $0.50 |
| **Route53 Queries** | ~100,000/month | ~$0.40 |
| **ACM Certificate** | 1 certificate | $0.00 (free) |
| **IAM User** | 1 user | $0.00 (free) |
| **AppRegistry** | 1 application | $0.00 (free) |

**Total Estimated Cost**: ~$1.85 - $2.40/month

### Cost Optimization Features

This configuration includes several cost optimizations:

1. **PriceClass_100**: Uses only North America and Europe edge locations
2. **No CloudFront Logging**: Reduces S3 storage costs
3. **No S3 Versioning**: Reduces storage costs for static sites
4. **Lifecycle Policy**: Automatically deletes old deployment artifacts after 30 days
5. **Aggressive Caching**: Reduces origin requests and data transfer

### Monitoring Costs

Monitor your actual costs in the AWS Console:

1. Navigate to AWS Cost Explorer
2. Filter by tags:
   - `Application = vs-calculator`
   - `Project = vintage-story-calculator`
3. Set up billing alerts for unexpected cost increases

## Managing Infrastructure

### View Current State

```bash
terraform show
```

### Update Infrastructure

After modifying `.tf` files:

```bash
terraform plan   # Preview changes
terraform apply  # Apply changes
```

### Destroy Infrastructure

To remove all resources:

```bash
terraform destroy
```

**Warning**: This will permanently delete all resources including the S3 bucket and its contents.

## Troubleshooting

### Issue: "Hosted zone not found"

**Error**: `Error: no matching Route53Zone found`

**Solution**: Ensure the hosted zone for `tcousin.com` exists in Route53. Create it manually if needed.

### Issue: "Certificate validation timeout"

**Error**: Certificate validation takes longer than expected

**Solution**:
- Verify Route53 hosted zone is correctly configured
- Check that nameservers are properly delegated
- DNS propagation can take up to 48 hours

### Issue: "Bucket name already exists"

**Error**: `BucketAlreadyExists` or `BucketAlreadyOwnedByYou`

**Solution**: The configuration uses a random suffix to prevent conflicts. If this occurs, run `terraform destroy` and `terraform apply` again.

### Issue: "Access denied" errors

**Error**: Various access denied errors during apply

**Solution**: Verify your AWS credentials have the required permissions listed in Prerequisites.

### Issue: CloudFront distribution deployment is slow

**Note**: CloudFront distributions typically take 10-15 minutes to deploy. This is normal AWS behavior.

## Security Considerations

### IAM Credentials

- The IAM user has minimal permissions (S3 upload and CloudFront invalidation only)
- Credentials should be rotated every 90 days
- Never commit credentials to version control
- Store credentials securely in GitHub Secrets

### S3 Bucket

- Public access is blocked
- Access only through CloudFront Origin Access Control
- Server-side encryption enabled (AES256)

### CloudFront

- HTTPS only (HTTP redirects to HTTPS)
- TLS 1.2 minimum protocol version
- Security headers policy applied

## Additional Resources

- [Terraform AWS Provider Documentation](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [AWS CloudFront Documentation](https://docs.aws.amazon.com/cloudfront/)
- [AWS S3 Static Website Hosting](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html)
- [Terraform Best Practices](https://www.terraform.io/docs/cloud/guides/recommended-practices/index.html)

## Support

For issues related to:
- **Infrastructure**: Review Terraform documentation and AWS service limits
- **Application**: See main project README.md
- **Deployment**: See DEPLOYMENT.md in project root
