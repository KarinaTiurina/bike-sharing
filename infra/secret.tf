
resource "google_secret_manager_secret" "hmac" {
  secret_id = "hmac"
  replication {
    auto {}
  }
}
