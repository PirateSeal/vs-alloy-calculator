# CloudFront Function: strip /umami prefix before forwarding to cloud.umami.is
# e.g. /umami/script.js → /script.js
resource "aws_cloudfront_function" "umami_rewrite" {
  name    = "${var.project_name}-umami-rewrite"
  runtime = "cloudfront-js-2.0"
  comment = "Strip /umami prefix before forwarding to cloud.umami.is"
  publish = true

  code = <<-EOT
    function handler(event) {
      var request = event.request;
      request.uri = request.uri.replace(/^\/umami/, '') || '/';
      return request;
    }
  EOT
}

# Origin request policy for /api/* proxy.
# Forwards Content-Type so Umami can parse the JSON event body.
# Does NOT forward Host — CloudFront will use cloud.umami.is as the Host
# header toward the origin, which is required (Umami rejects wrong Host).
resource "aws_cloudfront_origin_request_policy" "umami_api" {
  name    = "${var.project_name}-umami-api"
  comment = "Forward Content-Type to Umami API; suppress Host header"

  headers_config {
    header_behavior = "whitelist"
    headers {
      items = ["Content-Type", "Origin"]
    }
  }

  cookies_config {
    cookie_behavior = "none"
  }

  query_strings_config {
    query_string_behavior = "none"
  }
}
