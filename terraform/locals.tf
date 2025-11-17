locals {
  common_tags = {
    Application = var.project_name
    Environment = var.environment
    ManagedBy   = "terraform"
    Project     = "vintage-story-calculator"
  }
}
