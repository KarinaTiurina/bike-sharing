variable "project" {}

variable "credentials_file" {}

variable "region" {
  default = "europe-central2"
}

variable "zones" {
  default = [
    "europe-central2-c",
    "europe-central2-a",
    "europe-central2-b",
  ]
}

variable "abbr_location" {
  # ASIA, EU, US
  default = "EU"
}

variable "oauth_client_id" {}

variable "oauth_client_secret" {}
