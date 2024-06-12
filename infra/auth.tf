data "google_iam_policy" "noauth" {
  binding {
    role = "roles/run.invoker"
    members = [
      "allUsers",
    ]
  }
}

resource "google_cloud_run_service_iam_policy" "noauth_customer_fe" {
  location = var.region
  project = var.project
  service = google_cloud_run_v2_service.customer_fe.name
  policy_data = data.google_iam_policy.noauth.policy_data
}

resource "google_cloud_run_service_iam_policy" "noauth_bike_api" {
  location = var.region
  project = var.project
  service = google_cloud_run_v2_service.bike_api.name
  policy_data = data.google_iam_policy.noauth.policy_data
}
