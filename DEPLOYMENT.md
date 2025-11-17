# Deployment Guide

This guide walks you through deploying the Vintage Story Alloy Calculator to AWS using the automated CI/CD pipeline.

## Overview

The deployment process uses:
- **Terraform**: Infrastructure as Code for AWS resources
- **GitHub Actions**: Automated CI/CD pipeline
- **AWS Services**: S3, CloudFront, Route53, ACM

Once configured, deployments are fully automated on every push to the `main` branch.

## Prerequisites

Before starting, ensure you have:

- [ ] AWS account with appropriate permissions
- [ ] Route53 hosted zone for `tcousin.com`
- [ ] Terraform installed (>= 1.0)
- [ ] AWS CLI configured
- [ ] GitHub repository with admin access

## Step 1: Deploy Infrastructure with Terraform

### 1.1 Navigate to Terraform Directory

```bash
cd terraform
```

### 1.2 Initialize Terraform

```bash
terraform init
```

This downloads the AWS provider and prepares Terraform.

### 1.3 Review the Deployment Plan

```bash
terraform plan
```

Review the resources that will be created:
- S3 bucket for static hosting
- CloudFront distribution for CDN
- ACM certificate for HTTPS
- Route53 DNS records
- IAM user for GitHub Actions
- AppRegistry application

### 1.4 Deploy Infrastructure

```bash
terraform apply
```

Type `yes` when prompted. The deployment takes approximately 15-20 minutes.

**What's happening:**
- Creating S3 bucket with encryption and policies
- Requesting ACM certificate and validating via DNS
- Deploying CloudFront distribution globally
- Creating Route53 DNS records
- Setting up IAM user with minimal permissions

### 1.5 Save Terraform Outputs

After successful deployment, save the outputs:

```bash
terraform output -json > outputs.json
```

Keep this file secure as it contains sensitive credentials.

## Step 2: Configure GitHub Secrets

GitHub Secrets store sensitive credentials securely for the CI/CD pipeline.

### 2.1 Navigate to GitHub Repository Settings

1. Go to your GitHub repository
2. Click **Settings** (top menu)
3. In the left sidebar, click **Secrets and variables** → **Actions**
4. Click **New repository secret**

### 2.2 Add Required Secrets

Add each of the following secrets using the Terraform outputs:

#### AWS_ACCESS_KEY_ID

```bash
terraform output iam_access_key_id
```

- Click **New repository secret**
- Name: `AWS_ACCESS_KEY_ID`
- Value: Paste the output from the command above
- Click **Add secret**

#### AWS_SECRET_ACCESS_KEY

```bash
terraform output -raw iam_secret_access_key
```

- Click **New repository secret**
- Name: `AWS_SECRET_ACCESS_KEY`
- Value: Paste the output from the command above
- Click **Add secret**

**Important**: This is a sensitive credential. Never commit it to version control.

#### S3_BUCKET_NAME

```bash
terraform output s3_bucket_name
```

- Click **New repository secret**
- Name: `S3_BUCKET_NAME`
- Value: Paste the output from the command above
- Click **Add secret**

#### CLOUDFRONT_DISTRIBUTION_ID

```bash
terraform output cloudfront_distribution_id
```

- Click **New repository secret**
- Name: `CLOUDFRONT_DISTRIBUTION_ID`
- Value: Paste the output from the command above
- Click **Add secret**

#### AWS_REGION

- Click **New repository secret**
- Name: `AWS_REGION`
- Value: `us-east-1`
- Click **Add secret**

### 2.3 Verify Secrets

After adding all secrets, you should see:
- AWS_ACCESS_KEY_ID
- AWS_SECRET_ACCESS_KEY
- S3_BUCKET_NAME
- CLOUDFRONT_DISTRIBUTION_ID
- AWS_REGION

## Step 3: First Deployment

### 3.1 Trigger Deployment

The GitHub Actions workflow triggers automatically on:
- Push to `main` branch
- Manual trigger via workflow_dispatch

#### Option A: Push to Main Branch

```bash
git add .
git commit -m "Initial deployment setup"
git push origin main
```

#### Option B: Manual Trigger

1. Go to your GitHub repository
2. Click **Actions** tab
3. Select **Deploy to AWS** workflow
4. Click **Run workflow**
5. Select branch: `main`
6. Click **Run workflow**

### 3.2 Monitor Deployment

1. Go to **Actions** tab in GitHub
2. Click on the running workflow
3. Watch the deployment steps:
   - ✓ Checkout code
   - ✓ Setup Node.js
   - ✓ Setup pnpm
   - ✓ Install dependencies
   - ✓ Build application
   - ✓ Configure AWS credentials
   - ✓ Sync to S3
   - ✓ Invalidate CloudFront cache

### 3.3 Deployment Timeline

- **Build**: ~2-3 minutes
- **S3 Sync**: ~30 seconds
- **CloudFront Invalidation**: ~2-5 minutes

Total deployment time: ~5-10 minutes

## Step 4: Verify Deployment

### 4.1 Check Workflow Status

Ensure the GitHub Actions workflow completed successfully:
- All steps show green checkmarks
- No error messages in logs

### 4.2 Access the Website

Open your browser and navigate to:

```
https://vs-calculator.tcousin.com
```

### 4.3 Verify HTTPS

Check that:
- URL shows `https://` (not `http://`)
- Browser shows a lock icon
- Certificate is valid and issued by Amazon

### 4.4 Test Application Functionality

- Application loads correctly
- All features work as expected
- No console errors in browser DevTools

### 4.5 Test SPA Routing

Direct navigation to application routes should work:

```
https://vs-calculator.tcousin.com/some-route
```

The application should load correctly (not show 404 error).

### 4.6 Test HTTP to HTTPS Redirect

Try accessing via HTTP:

```
http://vs-calculator.tcousin.com
```

Should automatically redirect to HTTPS.

### 4.7 Test WWW Subdomain

The www subdomain should also work:

```
https://www.vs-calculator.tcousin.com
```

## Step 5: Subsequent Deployments

After initial setup, deployments are fully automated.

### 5.1 Make Code Changes

Edit your application code as needed:

```bash
# Make changes to src/ files
git add .
git commit -m "Update feature X"
```

### 5.2 Push to Main Branch

```bash
git push origin main
```

### 5.3 Automatic Deployment

GitHub Actions automatically:
1. Builds the application
2. Syncs files to S3
3. Invalidates CloudFront cache
4. New version is live in ~5-10 minutes

### 5.4 Monitor Deployment

Check the Actions tab to monitor progress and ensure successful deployment.

## Troubleshooting

### Issue: Workflow fails with "Access Denied"

**Symptoms**: GitHub Actions fails during S3 sync or CloudFront invalidation

**Solutions**:
1. Verify all GitHub Secrets are configured correctly
2. Check that secret names match exactly (case-sensitive)
3. Ensure IAM user has correct permissions
4. Try retrieving Terraform outputs again and updating secrets

### Issue: Website shows 403 Forbidden

**Symptoms**: Accessing the URL shows "Access Denied" error

**Solutions**:
1. Verify S3 bucket policy allows CloudFront access
2. Check that files were uploaded to S3:
   ```bash
   aws s3 ls s3://YOUR_BUCKET_NAME/
   ```
3. Verify CloudFront distribution is deployed (status: "Deployed")
4. Wait 10-15 minutes for CloudFront distribution to fully deploy

### Issue: SSL Certificate Error

**Symptoms**: Browser shows certificate warning or error

**Solutions**:
1. Verify ACM certificate is validated (status: "Issued")
2. Check that CloudFront distribution is using the correct certificate
3. Wait for DNS propagation (up to 48 hours)
4. Clear browser cache and try again

### Issue: DNS Not Resolving

**Symptoms**: Domain doesn't resolve or shows "Server not found"

**Solutions**:
1. Verify Route53 records were created:
   ```bash
   aws route53 list-resource-record-sets --hosted-zone-id YOUR_ZONE_ID
   ```
2. Check that nameservers are correctly delegated
3. Wait for DNS propagation (up to 48 hours)
4. Test with `dig` or `nslookup`:
   ```bash
   dig vs-calculator.tcousin.com
   ```

### Issue: Old Version Still Showing

**Symptoms**: Website shows old content after deployment

**Solutions**:
1. Verify CloudFront invalidation completed successfully
2. Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)
3. Check CloudFront invalidation status:
   ```bash
   aws cloudfront get-invalidation \
     --distribution-id YOUR_DIST_ID \
     --id INVALIDATION_ID
   ```
4. Manually create invalidation if needed:
   ```bash
   aws cloudfront create-invalidation \
     --distribution-id YOUR_DIST_ID \
     --paths "/*"
   ```

### Issue: Build Fails in GitHub Actions

**Symptoms**: Workflow fails during "Build application" step

**Solutions**:
1. Test build locally:
   ```bash
   pnpm install
   pnpm run build:prod
   ```
2. Check for TypeScript errors or linting issues
3. Verify all dependencies are in package.json
4. Review build logs in GitHub Actions for specific errors

### Issue: Deployment is Slow

**Symptoms**: Deployment takes longer than expected

**Expected Times**:
- Build: 2-3 minutes (normal)
- S3 Sync: 30 seconds (normal)
- CloudFront Invalidation: 2-5 minutes (normal)

If significantly slower:
1. Check GitHub Actions runner status
2. Verify AWS service health status
3. Consider using CloudFront cache headers to reduce invalidation frequency

## Rollback Procedure

If a deployment introduces issues, you can rollback to a previous version.

### Option 1: Revert Git Commit

```bash
# Find the commit hash of the working version
git log

# Revert to that commit
git revert HEAD

# Push to trigger new deployment
git push origin main
```

### Option 2: Redeploy Previous Version

```bash
# Checkout previous commit
git checkout PREVIOUS_COMMIT_HASH

# Force push to main (use with caution)
git push origin main --force
```

### Option 3: Manual Rollback

If GitHub Actions is unavailable:

```bash
# Build previous version locally
git checkout PREVIOUS_COMMIT_HASH
pnpm install
pnpm run build:prod

# Manually sync to S3
aws s3 sync dist/ s3://YOUR_BUCKET_NAME/ --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id YOUR_DIST_ID \
  --paths "/*"
```

## Security Best Practices

### Rotate IAM Credentials

Rotate IAM access keys every 90 days:

1. Create new access key in AWS Console
2. Update GitHub Secrets with new credentials
3. Test deployment with new credentials
4. Delete old access key

### Monitor AWS Costs

Set up billing alerts:

1. Go to AWS Billing Console
2. Create CloudWatch billing alarm
3. Set threshold (e.g., $10/month)
4. Configure email notifications

### Review IAM Permissions

Periodically review IAM user permissions:

```bash
aws iam list-user-policies --user-name vs-calculator-github-actions
```

Ensure principle of least privilege is maintained.

### Enable MFA for AWS Account

Protect your AWS root account:

1. Enable Multi-Factor Authentication (MFA)
2. Use IAM users for daily operations
3. Never share root credentials

## Monitoring and Maintenance

### Check Deployment Status

View recent deployments:

1. Go to GitHub repository
2. Click **Actions** tab
3. Review workflow runs

### Monitor Website Uptime

Consider using:
- AWS CloudWatch Synthetics
- Third-party uptime monitoring (UptimeRobot, Pingdom)
- Route53 health checks

### Review CloudFront Metrics

Monitor performance in AWS Console:

1. Go to CloudFront console
2. Select your distribution
3. View **Monitoring** tab
4. Review metrics:
   - Requests
   - Data transfer
   - Error rate
   - Cache hit ratio

### Check SSL Certificate Expiration

ACM automatically renews certificates, but verify:

1. Go to ACM console
2. Check certificate status
3. Ensure "In use" and "Issued" status

## Cost Optimization

### Monitor Monthly Costs

Expected costs: ~$2-3/month

Track actual costs:

1. AWS Cost Explorer
2. Filter by tags: `Application = vs-calculator`
3. Set up billing alerts for anomalies

### Reduce Costs Further

Optional optimizations:

1. **Reduce CloudFront price class**: Use PriceClass_100 (already configured)
2. **Optimize cache TTL**: Increase cache duration for static assets
3. **Compress assets**: Ensure gzip/brotli compression (already enabled)
4. **Minimize invalidations**: Use versioned filenames instead of frequent invalidations

## Additional Resources

- [Terraform README](terraform/README.md) - Infrastructure documentation
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [AWS CloudFront Best Practices](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/best-practices.html)
- [AWS S3 Static Website Hosting](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html)

## Getting Help

If you encounter issues not covered in this guide:

1. Check GitHub Actions logs for detailed error messages
2. Review AWS CloudWatch logs
3. Consult Terraform documentation
4. Check AWS service health dashboard

## Next Steps

After successful deployment:

- [ ] Set up monitoring and alerts
- [ ] Configure custom error pages (optional)
- [ ] Enable CloudFront access logging (optional)
- [ ] Set up staging environment (optional)
- [ ] Configure automated backups (optional)
