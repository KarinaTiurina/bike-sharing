resource "google_container_registry" "container_registry" {
  # Ensure some bucket for container registry exists.
  location = var.abbr_location
}

output "gcr_bucket_uri" {
  value = google_container_registry.container_registry.bucket_self_link
}

data "google_container_registry_repository" "container_registry_repo" {
  region = var.abbr_location
}
output "gcr_uri" {
  value = data.google_container_registry_repository.container_registry_repo.repository_url
}

data "google_container_registry_image" "admin_api_image" {
  name = "bike_admin_api"
}
output "admin_api_gcr_uri" {
  value = data.google_container_registry_image.admin_api_image.image_url
}

data "google_container_registry_image" "support_api_image" {
  name = "bike_support_api"
}
output "support_api_gcr_uri" {
  value = data.google_container_registry_image.support_api_image.image_url
}

data "google_container_registry_image" "bike_api_image" {
  name = "bike_api"
}
output "bike_api_gcr_uri" {
  value = data.google_container_registry_image.bike_api_image.image_url
}

data "google_container_registry_image" "user_api_image" {
  name = "bike_user_api"
}
output "user_api_gcr_uri" {
  value = data.google_container_registry_image.user_api_image.image_url
}

data "google_container_registry_image" "management_fe_image" {
  name = "bike_management_fe"
}
output "management_fe_gcr_uri" {
  value = data.google_container_registry_image.management_fe_image.image_url
}

data "google_container_registry_image" "customer_fe_image" {
  name = "bike_customer_fe"
}
output "customer_fe_gcr_uri" {
  value = data.google_container_registry_image.customer_fe_image.image_url
}

