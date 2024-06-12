// API resources

resource "google_cloud_run_v2_service" "admin_api" {
  name     = "admin-api"
  location = var.region

  template {
    timeout = "5s"

    containers {
      image = "${var.container_registry}/bike-sharing/admin_api:latest"
      ports {
        container_port = 8080
      }
      resources {
        limits = {
          cpu    = "2"
          memory = "1024Mi"
        }
      }
    }

    vpc_access {
      egress = "PRIVATE_RANGES_ONLY"

      network_interfaces {
        subnetwork = google_compute_subnetwork.private_subnetwork.id
      }
    }
  }

  traffic {
    type    = "TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST"
    percent = 100
  }
}

resource "google_cloud_run_v2_service" "support_api" {
  name     = "support-api"
  location = var.region

  template {
    timeout = "5s"

    containers {
      image = "${var.container_registry}/bike-sharing/support_api:latest"
      ports {
        container_port = 8080
      }
      resources {
        limits = {
          cpu    = "2"
          memory = "1024Mi"
        }
      }
    }

    vpc_access {
      egress = "PRIVATE_RANGES_ONLY"

      network_interfaces {
        subnetwork = google_compute_subnetwork.private_subnetwork.id
      }
    }
  }

  traffic {
    type    = "TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST"
    percent = 100
  }
}

resource "google_cloud_run_v2_service" "customer_api" {
  name     = "customer-api"
  location = var.region

  template {
    timeout = "5s"

    containers {
      image = "${var.container_registry}/bike-sharing/customer_api:latest"
      ports {
        container_port = 8080
      }
      resources {
        limits = {
          cpu    = "2"
          memory = "1024Mi"
        }
      }
      env {
        name = "JWKS_URI"
        value = var.jwks_uri
      }
      env {
        name = "ISSUER"
        value = var.issuer
      }
      env {
        name = "AUDIENCE"
        value = var.audience
      }
    }

    vpc_access {
      egress = "PRIVATE_RANGES_ONLY"

      network_interfaces {
        subnetwork = google_compute_subnetwork.private_subnetwork.id
      }
    }
  }

  traffic {
    type    = "TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST"
    percent = 100
  }
}

resource "google_cloud_run_v2_service" "bike_api" {
  name     = "bike-api"
  location = var.region

  template {
    timeout = "5s"

    containers {
      image = "${var.container_registry}/bike-sharing/bike_api:latest"
      ports {
        container_port = 8080
      }
      resources {
        limits = {
          cpu    = "2"
          memory = "1024Mi"
        }
      }
      env {
        name = "HMAC_SECRET"
        value_source {
          secret_key_ref {
            secret = google_secret_manager_secret.hmac.secret_id
            version = "1"
          }
        }
      }
    }
  }

  traffic {
    type    = "TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST"
    percent = 100
  }
}

// FE resources

resource "google_cloud_run_v2_service" "management_fe" {
  name     = "management-fe"
  location = var.region

  template {
    timeout = "5s"

    containers {
      image = "${var.container_registry}/bike-sharing/bs-frontend-amd64:latest"
      ports {
        container_port = 8080
      }
    }

    vpc_access {
      egress = "ALL_TRAFFIC"
      network_interfaces {
        subnetwork = google_compute_subnetwork.public_subnetwork.id
      }
    }
  }

  traffic {
    type    = "TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST"
    percent = 100
  }
}

resource "google_cloud_run_v2_service" "customer_fe" {
  name     = "customer-fe"
  location = var.region

  template {
    timeout = "5s"

    containers {
      image = "${var.container_registry}/bike-sharing/bs-frontend-amd64:latest"
      ports {
        container_port = 3000
      }
      resources {
        limits = {
          cpu    = "2"
          memory = "1024Mi"
        }
      }
    }
  }

  traffic {
    type    = "TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST"
    percent = 100
  }
}
