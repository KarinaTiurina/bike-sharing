# resource "google_project_service" "identitytoolkit" {
#   project = data.google_project.project.project_id
#   service = "identitytoolkit.googleapis.com"
# }

# resource "google_identity_platform_config" "default" {
#   project                    = data.google_project.project.project_id
#   autodelete_anonymous_users = true

#   sign_in {
#     allow_duplicate_emails = false

#     anonymous {
#       enabled = false
#     }
#     email {
#       enabled           = true
#       password_required = true
#     }
#     phone_number {
#       enabled = false
#     }
#   }

#   mfa {
#     state             = "ENABLED"
#     enabled_providers = ["PHONE_SMS"]
#   }

#   sms_region_config {
#     allowlist_only {
#       allowed_regions = [
#         var.abbr_location,
#       ]
#     }
#   }
#   #   blocking_functions {
#   #     triggers {
#   #       event_type = "beforeSignIn"
#   #       function_uri = "https://us-east1-my-project.cloudfunctions.net/before-sign-in"
#   #     }
#   #     forward_inbound_credentials {
#   #       refresh_token = true
#   #       access_token = true
#   #       id_token = true
#   #     }
#   #   }
#   quota {
#     sign_up_quota_config {
#       quota          = 1000
#       start_time     = ""
#       quota_duration = "7200s"
#     }
#   }
#   authorized_domains = [
#     "localhost",
#     google_certificate_manager_dns_authorization.customer_instance.domain,
#   ]
# }